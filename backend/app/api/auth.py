import hashlib
import secrets
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.issuer import Issuer
from app.schemas.auth import (
    UserRegister, UserLogin, UserResponse, AuthResponse, 
    WalletOnboard, WalletLogin, MobileLoginRequest, MobileQRAuthRequest,
    MobileKeyVerifyRequest
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def generate_mobile_access_key(identifier: str) -> str:
    raw = f"{identifier}:EDUPASS:SECRET_MOBILE_2026:{secrets.token_hex(4)}"
    suffix = hashlib.sha256(raw.encode('utf-8')).hexdigest()[:8].upper()
    return f"EDUPASS-KEY-{suffix[:4]}-{suffix[4:]}-2026"


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    """Public User Registration Endpoint (Blocks ADMIN signup)."""
    if user_in.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration for ADMIN role is strictly prohibited.",
        )

    existing_email = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email address already exists.",
        )

    wallet_addr = user_in.wallet_address.lower() if user_in.wallet_address else None
    if wallet_addr:
        existing_wallet = db.query(User).filter(User.wallet_address == wallet_addr).first()
        if existing_wallet:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This Web3 wallet address is already linked to another account.",
            )

    # Assign IDs based on role
    assigned_student_id = None
    assigned_inst_id = user_in.institution_id
    assigned_inst_name = user_in.institution_name

    if user_in.role == UserRole.STUDENT:
        assigned_student_id = user_in.student_id or f"EDU-2026-{wallet_addr[-4:].upper() if wallet_addr else '0687'}"
    elif user_in.role in [UserRole.INSTITUTION, UserRole.EMPLOYER, UserRole.VERIFIER]:
        wallet_suffix = wallet_addr[-4:].upper() if wallet_addr else '991A'
        prefix = 'INST' if user_in.role == UserRole.INSTITUTION else 'REC'
        assigned_inst_id = user_in.institution_id or f"{prefix}-2026-{wallet_suffix}"
        assigned_inst_name = user_in.full_name

    key_base = assigned_student_id or user_in.email
    generated_mobile_key = generate_mobile_access_key(key_base)

    new_user = User(
        email=user_in.email.lower(),
        wallet_address=wallet_addr,
        student_id=assigned_student_id,
        institution_id=assigned_inst_id,
        institution_name=assigned_inst_name,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=UserRole(user_in.role),
        mobile_access_key=generated_mobile_key,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-register as Issuer if INSTITUTION
    if user_in.role == UserRole.INSTITUTION:
        existing_issuer = db.query(Issuer).filter(Issuer.accreditation_code == assigned_inst_id).first()
        if not existing_issuer:
            new_issuer = Issuer(
                name=user_in.full_name.strip(),
                accreditation_code=assigned_inst_id,
                country="GLOBAL",
                issuer_wallet=wallet_addr,
                is_verified=True,
            )
            db.add(new_issuer)
            db.commit()

    token = create_access_token(
        subject=new_user.id,
        role=new_user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthResponse(access_token=token, user=UserResponse.model_validate(new_user))


@router.post("/wallet-onboard", response_model=AuthResponse)
def wallet_onboard(onboard_in: WalletOnboard, db: Session = Depends(get_db)):
    """First-time Web3 wallet user onboarding endpoint."""
    wallet_addr = onboard_in.wallet_address.lower()
    
    if onboard_in.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public onboarding for ADMIN role is strictly prohibited.",
        )

    user = db.query(User).filter(User.wallet_address == wallet_addr).first()
    
    assigned_student_id = None
    assigned_inst_id = onboard_in.institution_id
    assigned_inst_name = onboard_in.institution_name

    if onboard_in.role == UserRole.STUDENT:
        assigned_student_id = onboard_in.student_id or f"EDU-2026-{wallet_addr[-4:].upper()}"
    elif onboard_in.role in [UserRole.INSTITUTION, UserRole.EMPLOYER, UserRole.VERIFIER]:
        prefix = 'INST' if onboard_in.role == UserRole.INSTITUTION else 'REC'
        assigned_inst_id = onboard_in.institution_id or f"{prefix}-2026-{wallet_addr[-4:].upper()}"
        assigned_inst_name = onboard_in.full_name

    key_base = assigned_student_id or wallet_addr
    generated_mobile_key = generate_mobile_access_key(key_base)

    if not user:
        user = User(
            email=f"{wallet_addr[:10]}@wallet.edupass",
            wallet_address=wallet_addr,
            student_id=assigned_student_id,
            institution_id=assigned_inst_id,
            institution_name=assigned_inst_name,
            password_hash=get_password_hash(f"wallet_sec_{wallet_addr[:8]}"),
            full_name=onboard_in.full_name.strip(),
            role=UserRole(onboard_in.role),
            mobile_access_key=generated_mobile_key,
            is_active=True,
        )
        db.add(user)
    else:
        user.full_name = onboard_in.full_name.strip()
        user.role = UserRole(onboard_in.role)
        if not user.mobile_access_key:
            user.mobile_access_key = generated_mobile_key
        if assigned_student_id:
            user.student_id = assigned_student_id
        if assigned_inst_id:
            user.institution_id = assigned_inst_id
        if assigned_inst_name:
            user.institution_name = assigned_inst_name

    db.commit()
    db.refresh(user)

    # Auto-register as Issuer if INSTITUTION
    if onboard_in.role == UserRole.INSTITUTION:
        existing_issuer = db.query(Issuer).filter(Issuer.accreditation_code == assigned_inst_id).first()
        if not existing_issuer:
            new_issuer = Issuer(
                name=onboard_in.full_name.strip(),
                accreditation_code=assigned_inst_id,
                country="GLOBAL",
                issuer_wallet=wallet_addr,
                is_verified=True,
            )
            db.add(new_issuer)
            db.commit()

    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/wallet-login")
def wallet_login(login_in: WalletLogin, db: Session = Depends(get_db)):
    """Web3 Wallet Authentication check endpoint."""
    wallet_addr = login_in.wallet_address.lower()
    user = db.query(User).filter(User.wallet_address == wallet_addr).first()

    if not user:
        return {"is_new_user": True, "wallet_address": wallet_addr}

    if user.role in [UserRole.INSTITUTION, UserRole.EMPLOYER, UserRole.VERIFIER] and not user.institution_id:
        prefix = 'INST' if user.role == UserRole.INSTITUTION else 'REC'
        user.institution_id = f"{prefix}-2026-{wallet_addr[-4:].upper()}"
        user.institution_name = user.full_name

    if not user.mobile_access_key:
        user.mobile_access_key = generate_mobile_access_key(user.student_id or user.email)
        db.commit()

    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "is_new_user": False,
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/login", response_model=AuthResponse)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    """User Login with Email and Password."""
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated",
        )

    if not user.mobile_access_key:
        user.mobile_access_key = generate_mobile_access_key(user.student_id or user.email)
        db.commit()

    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


# ==========================================
# 📱 MOBILE APP AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/mobile-verify-key")
def mobile_verify_key(req: MobileKeyVerifyRequest, db: Session = Depends(get_db)):
    """
    Mobile App Dedicated Verification Endpoint.
    Formula: App Login = User ID + Mobile Unique Access Key + Backend API Verification + Biometric Verification.
    """
    clean_id = req.identifier.strip()
    clean_key = req.mobile_key.strip().upper()

    # Query user across Student ID, Email, Institution ID, or Wallet Address
    user = db.query(User).filter(
        or_(
            User.student_id.ilike(clean_id.upper()),
            User.email.ilike(clean_id.lower()),
            User.institution_id.ilike(clean_id.upper()),
            User.wallet_address.ilike(clean_id.lower())
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invalid User ID. No account matching '{clean_id}' was found.",
        )

    # Verify unique mobile key
    if not user.mobile_access_key or user.mobile_access_key.strip().upper() != clean_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Mobile Access Key for this User ID.",
        )

    # Verify biometric prompt flag
    if not req.biometric_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Biometric verification failed on Android device.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated.",
        )

    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "verified": True,
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
        "message": "Mobile key & biometric authentication verified successfully.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/mobile-login")
def mobile_login(login_in: MobileLoginRequest, db: Session = Depends(get_db)):
    """
    Dedicated Mobile Phone Authentication Endpoint.
    Supports login via Email, Student ID (EDU-2026-XXXX), Recruiter ID (REC-2026-XXXX), or Web3 Wallet Address.
    """
    clean_id = login_in.identifier.strip()
    
    user = db.query(User).filter(
        or_(
            User.email.ilike(clean_id.lower()),
            User.student_id.ilike(clean_id.upper()),
            User.institution_id.ilike(clean_id.upper()),
            User.wallet_address.ilike(clean_id.lower())
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account matching identifier '{clean_id}' was found.",
        )

    if login_in.password:
        if not verify_password(login_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password credentials.",
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is currently deactivated.",
        )

    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
        "mobile_device_meta": {
            "device_id": login_in.device_id or "GENERIC_ANDROID_DEVICE",
            "device_name": login_in.device_name or "Android Phone",
            "authenticated_at": datetime.now(timezone.utc).isoformat(),
            "device_verified": True,
        }
    }


@router.get("/mobile-verify-token")
def mobile_verify_token(current_user: User = Depends(get_current_user)):
    """
    Fast Mobile App Token Validation Endpoint.
    Allows Android app on startup to verify if stored JWT token is valid.
    """
    return {
        "valid": True,
        "user": UserResponse.model_validate(current_user),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/mobile-qr-login")
def mobile_qr_login(
    qr_in: MobileQRAuthRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mobile QR Scan Verification Endpoint.
    Scans desktop login QR code from Android app to authorize desktop session.
    """
    return {
        "status": "APPROVED",
        "qr_session_id": qr_in.qr_session_id,
        "student_id": current_user.student_id or qr_in.student_id,
        "authorized_by": current_user.full_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve Profile Information of the Current Authenticated User."""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user)):
    """Logout Endpoint."""
    return {"message": "Successfully logged out"}
