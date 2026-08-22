from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.issuer import Issuer
from app.schemas.issuer import IssuerCreate, IssuerResponse
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/issuers", tags=["Issuer Accreditation Registry"])


@router.post("/register", response_model=IssuerResponse, status_code=status.HTTP_201_CREATED)
def register_issuer(
    issuer_in: IssuerCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Accredit and register an authorized educational institution issuer (ADMIN role required)."""
    code = issuer_in.accreditation_code.upper()
    existing = db.query(Issuer).filter(Issuer.accreditation_code == code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Issuer with accreditation code '{code}' already registered.",
        )

    new_issuer = Issuer(
        name=issuer_in.name.strip(),
        accreditation_code=code,
        country=issuer_in.country.strip().upper(),
        issuer_wallet=issuer_in.issuer_wallet.lower() if issuer_in.issuer_wallet else None,
        is_verified=True,
    )
    db.add(new_issuer)
    db.commit()
    db.refresh(new_issuer)

    return IssuerResponse.model_validate(new_issuer)


@router.post("/accredit/{issuer_id}", response_model=IssuerResponse)
def accredit_issuer(
    issuer_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Accredit an educational institution (ADMIN role required)."""
    issuer = db.query(Issuer).filter(Issuer.id == issuer_id).first()
    if not issuer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issuer not found.")

    issuer.is_verified = True
    db.commit()
    db.refresh(issuer)

    return IssuerResponse.model_validate(issuer)


@router.post("/revoke-accreditation/{issuer_id}", response_model=IssuerResponse)
def revoke_issuer_accreditation(
    issuer_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Revoke an educational institution's accreditation status (ADMIN role required)."""
    issuer = db.query(Issuer).filter(Issuer.id == issuer_id).first()
    if not issuer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issuer not found.")

    issuer.is_verified = False
    db.commit()
    db.refresh(issuer)

    return IssuerResponse.model_validate(issuer)


@router.get("/", response_model=List[IssuerResponse])
def list_accredited_issuers(db: Session = Depends(get_db)):
    """List all accredited educational institutions (including registered institution users)."""
    # 1. Fetch from Issuer table
    issuers = db.query(Issuer).filter(Issuer.is_verified == True).order_by(Issuer.name.asc()).all()
    results = [IssuerResponse.model_validate(i) for i in issuers]
    existing_codes = {i.accreditation_code for i in results}

    # 2. Also dynamically include registered INSTITUTION users
    inst_users = db.query(User).filter(User.role == UserRole.INSTITUTION).all()
    for u in inst_users:
        code = u.institution_id or f"INST-2026-{u.id[:4].upper()}"
        if code not in existing_codes and u.full_name:
            results.append(
                IssuerResponse(
                    id=u.id,
                    name=u.institution_name or u.full_name,
                    accreditation_code=code,
                    country="GLOBAL",
                    issuer_wallet=u.wallet_address,
                    is_verified=True,
                    created_at=u.created_at,
                )
            )
            existing_codes.add(code)

    return results


@router.get("/all", response_model=List[IssuerResponse])
def list_all_issuers(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List all issuers including pending or revoked accreditations (ADMIN role required)."""
    issuers = db.query(Issuer).order_by(Issuer.created_at.desc()).all()
    return [IssuerResponse.model_validate(i) for i in issuers]


@router.get("/verify/{code}", response_model=IssuerResponse)
def verify_issuer_accreditation(code: str, db: Session = Depends(get_db)):
    """Verify institution accreditation by code."""
    clean_code = code.strip().upper()
    issuer = db.query(Issuer).filter(Issuer.accreditation_code == clean_code).first()
    if not issuer or not issuer.is_verified:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No accredited issuer found matching code '{clean_code}'.",
        )
    return IssuerResponse.model_validate(issuer)
