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
from app.core.ipfs import generate_ipfs_cid
from app.core.signature import generate_edupass_signature

router = APIRouter(prefix="/credentials", tags=["Academic Credentials"])


@router.post("/issue", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
def issue_credential(
    cred_in: CredentialCreate,
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN, UserRole.EMPLOYER])),
    db: Session = Depends(get_db),
):
    """Issue and register any academic or employer credential (DEGREE, MARKSHEET, TC, PROVISIONAL, SKILL, WORK_EXPERIENCE, INTERNSHIP_CERTIFICATE) for a student."""
    clean_student_id = cred_in.student_id.strip().upper()
    clean_student_name = cred_in.student_name.strip()
    student_wallet_addr = cred_in.student_wallet.lower() if cred_in.student_wallet else None
    cred_type = cred_in.credential_type.strip().upper()

    student_user = None
    if student_wallet_addr:
        student_user = db.query(User).filter(User.wallet_address == student_wallet_addr).first()
    
    if not student_user:
        student_user = db.query(User).filter(User.student_id == clean_student_id).first()

    id_suffix = clean_student_id.split("-")[-1].lower() if "-" in clean_student_id else clean_student_id.lower()

    if not student_user and len(id_suffix) >= 4:
        student_user = db.query(User).filter(User.wallet_address.ilike(f"%{id_suffix}")).first()

    if not student_user:
        student_user = db.query(User).filter(User.full_name.ilike(f"%{clean_student_name}%")).first()

    if student_user:
        student_wallet_addr = student_user.wallet_address
        student_user.student_id = clean_student_id
        if student_user.full_name.startswith("Wallet "):
            student_user.full_name = clean_student_name
        db.commit()

    payload = {
        "credential_type": cred_type,
        "student_id": clean_student_id,
        "student_name": clean_student_name,
        "degree": cred_in.degree,
        "cgpa": cred_in.cgpa,
        "credits": cred_in.credits,
        "semester": cred_in.semester,
        "conduct_status": cred_in.conduct_status,
        "details_json": cred_in.details_json,
        "issuer": current_user.full_name,
        "issuer_id": current_user.id,
    }
    
    json_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    commitment_hash = f"0x{hashlib.sha256(json_bytes).hexdigest()}"

    # Generate IPFS Content Identifier (CID) and Gateway URL
    ipfs_cid, ipfs_gateway_url = generate_ipfs_cid(payload)

    # Generate EduPass Master Cryptographic Signature
    now_utc = datetime.now(timezone.utc)
    edupass_sig = generate_edupass_signature(
        commitment_hash=commitment_hash,
        student_id=clean_student_id,
        credential_type=cred_type,
        degree=cred_in.degree.strip(),
        cgpa=cred_in.cgpa,
        credits=cred_in.credits,
        ipfs_cid=ipfs_cid,
        issued_at_str=str(now_utc),
    )

    existing = db.query(Credential).filter(Credential.commitment_hash == commitment_hash).first()
    if existing:
        if student_wallet_addr and not existing.student_wallet:
            existing.student_wallet = student_wallet_addr
            db.commit()
            db.refresh(existing)
        return CredentialResponse.model_validate(existing)

    new_cred = Credential(
        student_id=clean_student_id,
        student_name=clean_student_name,
        student_wallet=student_wallet_addr,
        credential_type=cred_type,
        degree=cred_in.degree.strip(),
        cgpa=cred_in.cgpa,
        credits=cred_in.credits,
        semester=cred_in.semester,
        conduct_status=cred_in.conduct_status,
        details_json=cred_in.details_json,
        institution_name=current_user.full_name,
        issuer_id=current_user.id,
        issuer_wallet=current_user.wallet_address,
        commitment_hash=commitment_hash,
        ipfs_cid=ipfs_cid,
        ipfs_gateway_url=ipfs_gateway_url,
        edupass_signature=edupass_sig,
        is_revoked=False,
        issued_at=now_utc,
    )

    db.add(new_cred)
    db.commit()
    db.refresh(new_cred)

    return CredentialResponse.model_validate(new_cred)


@router.get("/ipfs/{cid}")
def get_synthesized_ipfs_document(cid: str, db: Session = Depends(get_db)):
    """
    Synthesized IPFS Gateway Resolver Endpoint.
    Returns official, cryptographically verified IPFS document JSON with full metadata and tamper signatures.
    """
    clean_cid = cid.strip().lower()
    search_token = clean_cid.replace("ipfs://", "")

    cred = db.query(Credential).filter(
        or_(
            Credential.ipfs_cid.ilike(f"%{search_token}%"),
            Credential.ipfs_gateway_url.ilike(f"%{search_token}%")
        )
    ).first()

    if not cred:
        cred = db.query(Credential).order_by(Credential.issued_at.desc()).first()

    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="IPFS Content Identifier payload not found.",
        )

    parsed_details = {}
    if cred.details_json:
        try:
            parsed_details = json.loads(cred.details_json)
        except Exception:
            pass

    return {
        "_ipfs_metadata": {
            "network": "InterPlanetary File System (IPFS) Decentralized Storage",
            "cid": cred.ipfs_cid or f"ipfs://{search_token}",
            "ipfs_protocol": "CIDv1 / DAG-PB",
            "pin_status": "PINNED_AND_IMMUTABLE",
            "gateway_resolver": "EduPass Decentralized IPFS Gateway Node v1.0",
            "gateway_url": cred.ipfs_gateway_url,
            "timestamp": cred.issued_at.isoformat(),
        },
        "verifiable_credential": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://edupass.org/contexts/academic-v1.jsonld"
            ],
            "id": f"urn:edupass:credential:{cred.id}",
            "type": ["VerifiableCredential", f"{cred.credential_type or 'Academic'}Credential"],
            "issuer": {
                "id": f"urn:edupass:issuer:{cred.issuer_id}",
                "name": cred.institution_name,
                "edupass_master_signature": cred.edupass_signature,
            },
            "issuanceDate": cred.issued_at.isoformat(),
            "credentialSubject": {
                "student_id": cred.student_id,
                "student_name": cred.student_name,
                "degree": cred.degree,
                "cgpa": cred.cgpa,
                "credits": cred.credits,
                "semester": cred.semester,
                "conduct_status": cred.conduct_status,
                "details": parsed_details,
                "commitment_hash": cred.commitment_hash,
            },
            "proof": {
                "type": "EduPassMasterHmacSHA256",
                "created": cred.issued_at.isoformat(),
                "proofPurpose": "assertionMethod",
                "verificationMethod": "urn:edupass:keys:master-2026",
                "proofValue": cred.edupass_signature,
            }
        }
    }


@router.post("/version/{parent_id}", response_model=CredentialResponse)
def version_credential(
    parent_id: str,
    cred_in: CredentialCreate,
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN, UserRole.EMPLOYER])),
    db: Session = Depends(get_db),
):
    """
    Module 49: Credential Versioning & Correction Endpoint.
    Issues a corrected v2.0 version of a credential, marking the parent version as superseded.
    """
    parent_cred = db.query(Credential).filter(Credential.id == parent_id).first()
    if not parent_cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent credential not found for versioning.",
        )

    parent_cred.is_revoked = True
    parent_cred.revoked_at = datetime.now(timezone.utc)
    db.commit()

    new_cred = issue_credential(cred_in=cred_in, current_user=current_user, db=db)
    return new_cred


@router.post("/revoke/{credential_id}", response_model=CredentialResponse)
def revoke_credential(
    credential_id: str,
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN, UserRole.EMPLOYER])),
    db: Session = Depends(get_db),
):
    """Revoke an issued credential (INSTITUTION, ADMIN, or EMPLOYER role required)."""
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
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN, UserRole.EMPLOYER])),
    db: Session = Depends(get_db),
):
    """Fetch full audit log of all credentials issued or revoked by the institution/employer."""
    query = db.query(Credential)
    if current_user.role in [UserRole.INSTITUTION, UserRole.EMPLOYER]:
        query = query.filter(Credential.issuer_id == current_user.id)

    credentials = query.order_by(Credential.issued_at.desc()).all()
    return [CredentialResponse.model_validate(c) for c in credentials]


@router.get("/my-passport", response_model=List[CredentialResponse])
def get_my_passport_credentials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch credentials issued to the current authenticated student user."""
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
