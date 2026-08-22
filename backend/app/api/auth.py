from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import UserRegister, UserLogin, UserResponse, AuthResponse, WalletOnboard, WalletLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
        assigned_student_id = user_in.student_id or f"EDU-2026-{wallet_addr[-4:].upper() if wallet_addr else '9283'}"
    elif user_in.role == UserRole.INSTITUTION:
        wallet_suffix = wallet_addr[-4:].upper() if wallet_addr else 'INST'
        assigned_inst_id = user_in.institution_id or f"INST-2026-{wallet_suffix}"
        assigned_inst_name = user_in.full_name

    new_user = User(
        email=user_in.email.lower(),
        wallet_address=wallet_addr,
        student_id=assigned_student_id,
        institution_id=assigned_inst_id,
        institution_name=assigned_inst_name,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=UserRole(user_in.role),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

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
    elif onboard_in.role == UserRole.INSTITUTION:
        assigned_inst_id = onboard_in.institution_id or f"INST-2026-{wallet_addr[-4:].upper()}"
        assigned_inst_name = onboard_in.full_name

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
            is_active=True,
        )
        db.add(user)
    else:
        user.full_name = onboard_in.full_name.strip()
        user.role = UserRole(onboard_in.role)
        if assigned_student_id:
            user.student_id = assigned_student_id
        if assigned_inst_id:
            user.institution_id = assigned_inst_id
        if assigned_inst_name:
            user.institution_name = assigned_inst_name

    db.commit()
    db.refresh(user)

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

    # Auto-assign institution_id if institution user lacks one
    if user.role == UserRole.INSTITUTION and not user.institution_id:
        user.institution_id = f"INST-2026-{wallet_addr[-4:].upper()}"
        user.institution_name = user.full_name
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

    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve Profile Information of the Current Authenticated User."""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user)):
    """Logout Endpoint."""
    return {"message": "Successfully logged out"}
