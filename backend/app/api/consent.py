from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.consent import ConsentGrant
from app.schemas.consent import ConsentCreate, ConsentResponse
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/consent", tags=["Consent Management"])


@router.post("/grant", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
def grant_consent(
    consent_in: ConsentCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Grant verifiable consent access to a third-party verifier or employer (STUDENT role required)."""
    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '9283'}"
    expires = datetime.now(timezone.utc) + timedelta(days=consent_in.valid_days)

    new_grant = ConsentGrant(
        student_id=student_id,
        student_wallet=current_user.wallet_address,
        verifier_name=consent_in.verifier_name.strip(),
        verifier_wallet=consent_in.verifier_wallet.lower() if consent_in.verifier_wallet else None,
        purpose=consent_in.purpose.strip().upper(),
        status="ACTIVE",
        expires_at=expires,
    )

    db.add(new_grant)
    db.commit()
    db.refresh(new_grant)

    return ConsentResponse.model_validate(new_grant)


@router.post("/revoke/{grant_id}", response_model=ConsentResponse)
def revoke_consent(
    grant_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Revoke an active consent grant (STUDENT role required)."""
    grant = db.query(ConsentGrant).filter(ConsentGrant.id == grant_id).first()
    if not grant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent grant record not found.",
        )

    grant.status = "REVOKED"
    db.commit()
    db.refresh(grant)

    return ConsentResponse.model_validate(grant)


@router.get("/my-grants", response_model=List[ConsentResponse])
def get_my_consent_grants(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Retrieve all active and revoked consent grants for the authenticated student."""
    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '9283'}"
    grants = db.query(ConsentGrant).filter(
        (ConsentGrant.student_id == student_id) | (ConsentGrant.student_wallet == current_user.wallet_address)
    ).order_by(ConsentGrant.created_at.desc()).all()

    return [ConsentResponse.model_validate(g) for g in grants]
