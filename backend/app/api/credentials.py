import hashlib
import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.credential import Credential
from app.schemas.credential import CredentialCreate, CredentialResponse
from app.dependencies.auth import get_current_user, require_any_role

router = APIRouter(prefix="/credentials", tags=["Academic Credentials"])


@router.post("/issue", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
def issue_credential(
    cred_in: CredentialCreate,
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Issue and register an academic credential for a student by Student ID (INSTITUTION or ADMIN role required)."""
    clean_student_id = cred_in.student_id.strip().upper()
    clean_student_name = cred_in.student_name.strip()
    student_wallet_addr = cred_in.student_wallet.lower() if cred_in.student_wallet else None

    # Search for registered student user matching student_id, student_wallet, suffix, or name
    student_user = None
    if student_wallet_addr:
        student_user = db.query(User).filter(User.wallet_address == student_wallet_addr).first()
    
    if not student_user:
        student_user = db.query(User).filter(User.student_id == clean_student_id).first()

    # Extract ID suffix e.g. "0687" from "EDU-2026-0687"
    id_suffix = clean_student_id.split("-")[-1].lower() if "-" in clean_student_id else clean_student_id.lower()

    if not student_user and len(id_suffix) >= 4:
        # Match student wallet ending with suffix e.g. "0687"
        student_user = db.query(User).filter(User.wallet_address.ilike(f"%{id_suffix}")).first()

    if not student_user:
        student_user = db.query(User).filter(User.full_name.ilike(f"%{clean_student_name}%")).first()

    # Automatically bind student user profile details if found
    if student_user:
        student_wallet_addr = student_user.wallet_address
        student_user.student_id = clean_student_id
        if student_user.full_name.startswith("Wallet "):
            student_user.full_name = clean_student_name
        db.commit()

    # Build deterministic JSON string for commitment hash calculation
    payload = {
        "student_id": clean_student_id,
        "student_name": clean_student_name,
        "degree": cred_in.degree,
        "cgpa": cred_in.cgpa,
        "credits": cred_in.credits,
        "issuer": current_user.full_name,
        "issuer_id": current_user.id,
    }
    
    # Cryptographic commitment hash
    json_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    commitment_hash = f"0x{hashlib.sha256(json_bytes).hexdigest()}"

    # Check for duplicate commitment
    existing = db.query(Credential).filter(Credential.commitment_hash == commitment_hash).first()
    if existing:
        # Update wallet address if newly linked
        if student_wallet_addr and not existing.student_wallet:
            existing.student_wallet = student_wallet_addr
            db.commit()
            db.refresh(existing)
        return CredentialResponse.model_validate(existing)

    new_cred = Credential(
        student_id=clean_student_id,
        student_name=clean_student_name,
        student_wallet=student_wallet_addr,
        degree=cred_in.degree.strip(),
        cgpa=cred_in.cgpa,
        credits=cred_in.credits,
        institution_name=current_user.full_name,
        issuer_id=current_user.id,
        issuer_wallet=current_user.wallet_address,
        commitment_hash=commitment_hash,
        is_revoked=False,
    )

    db.add(new_cred)
    db.commit()
    db.refresh(new_cred)

    return CredentialResponse.model_validate(new_cred)


@router.post("/revoke/{credential_id}", response_model=CredentialResponse)
def revoke_credential(
    credential_id: str,
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Revoke an issued credential (INSTITUTION or ADMIN role required)."""
    cred = db.query(Credential).filter(Credential.id == credential_id).first()
    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found.",
        )

    cred.is_revoked = True
    cred.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cred)

    return CredentialResponse.model_validate(cred)


@router.get("/audit-logs", response_model=List[CredentialResponse])
def get_institution_audit_logs(
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Fetch full audit log of all credentials issued or revoked by the institution."""
    query = db.query(Credential)
    if current_user.role == UserRole.INSTITUTION:
        query = query.filter(Credential.issuer_id == current_user.id)

    credentials = query.order_by(Credential.issued_at.desc()).all()
    return [CredentialResponse.model_validate(c) for c in credentials]


@router.get("/my-passport", response_model=List[CredentialResponse])
def get_my_passport_credentials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch active credentials issued to the current authenticated student user."""
    # Ensure current user has a student_id assigned
    if not current_user.student_id and current_user.wallet_address:
        wallet_suffix = current_user.wallet_address[-4:].upper()
        current_user.student_id = f"EDU-2026-{wallet_suffix}"
        db.commit()

    conditions = []
    
    if current_user.wallet_address:
        wallet_addr = current_user.wallet_address.lower()
        wallet_suffix = wallet_addr[-4:].upper()
        conditions.append(Credential.student_wallet.ilike(wallet_addr))
        conditions.append(Credential.student_id.ilike(f"%{wallet_suffix}"))

    if current_user.student_id:
        conditions.append(Credential.student_id.ilike(current_user.student_id))

    if current_user.full_name and not current_user.full_name.startswith("Wallet "):
        conditions.append(Credential.student_name.ilike(f"%{current_user.full_name.strip()}%"))

    credentials = db.query(Credential).filter(or_(*conditions)).order_by(Credential.issued_at.desc()).all()
    return [CredentialResponse.model_validate(c) for c in credentials]


@router.get("/student/{student_id}", response_model=List[CredentialResponse])
def get_credentials_by_student_id(
    student_id: str,
    db: Session = Depends(get_db),
):
    """Query all credentials issued to a specific Student ID."""
    clean_id = student_id.strip().upper()
    id_suffix = clean_id.split("-")[-1] if "-" in clean_id else clean_id
    
    credentials = db.query(Credential).filter(
        or_(
            Credential.student_id.ilike(clean_id),
            Credential.student_id.ilike(f"%{id_suffix}")
        )
    ).order_by(Credential.issued_at.desc()).all()
    return [CredentialResponse.model_validate(c) for c in credentials]


@router.get("/verify/{commitment_hash}", response_model=CredentialResponse)
def verify_credential_by_hash(
    commitment_hash: str,
    db: Session = Depends(get_db),
):
    """Verify and retrieve an issued academic credential by its cryptographic commitment hash."""
    clean_hash = commitment_hash.strip().lower()
    if not clean_hash.startswith("0x"):
        clean_hash = f"0x{clean_hash}"

    cred = db.query(Credential).filter(Credential.commitment_hash.ilike(clean_hash)).first()
    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No credential matching this cryptographic commitment hash was found.",
        )
    return CredentialResponse.model_validate(cred)
