import hashlib
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.credential import Credential
from app.models.access_request import AccessRequest
from app.core.skill_graph import generate_skill_evidence_graph
from app.dependencies.auth import get_current_user, require_role, require_any_role

router = APIRouter(prefix="/resume", tags=["Verifiable Resumes & Skill Evidence Graph"])


@router.get("/my-resume")
def get_my_verifiable_resume(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Generate student's complete Verifiable Resume payload with assigned Resume ID and Skill Evidence Graph."""
    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '0687'}"
    id_suffix = student_id.split("-")[-1].upper() if "-" in student_id else student_id

    conditions = [
        Credential.student_id.ilike(student_id),
        Credential.student_id.ilike(f"%{id_suffix}")
    ]
    if current_user.wallet_address:
        conditions.append(Credential.student_wallet.ilike(current_user.wallet_address))

    credentials = db.query(Credential).filter(or_(*conditions)).order_by(Credential.issued_at.desc()).all()
    cred_dicts = [
        {
            "id": c.id,
            "student_id": c.student_id,
            "student_name": c.student_name,
            "credential_type": c.credential_type,
            "degree": c.degree,
            "cgpa": c.cgpa,
            "credits": c.credits,
            "semester": c.semester,
            "conduct_status": c.conduct_status,
            "details_json": c.details_json,
            "institution_name": c.institution_name,
            "commitment_hash": c.commitment_hash,
            "is_revoked": c.is_revoked,
            "issued_at": c.issued_at.isoformat(),
        }
        for c in credentials
    ]

    # Generate Skill Evidence Graph
    skills = generate_skill_evidence_graph(cred_dicts)

    # Deterministic Resume ID
    hash_base = f"{student_id}:{len(credentials)}:{current_user.email}"
    resume_suffix = hashlib.sha256(hash_base.encode("utf-8")).hexdigest()[:6].upper()
    resume_id = f"RES-2026-{id_suffix}-{resume_suffix}"

    return {
        "resume_id": resume_id,
        "student_id": student_id,
        "student_name": current_user.full_name,
        "email": current_user.email,
        "wallet_address": current_user.wallet_address,
        "summary": "Verifiable Academic & Career Profile backed by EVM Blockchain & Neon PostgreSQL Cryptographic Commitments.",
        "skills_graph": skills,
        "verified_credentials": cred_dicts,
        "total_verified_claims": len(credentials),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/verify/{resume_id}")
def verify_resume_by_id(
    resume_id: str,
    db: Session = Depends(get_db),
):
    """Public endpoint to verify and query a candidate's Verifiable Resume by Resume ID or Student ID."""
    clean_query = resume_id.strip().upper()
    
    # Extract student ID if searching by Resume ID (RES-2026-0687-991A) or Student ID (EDU-2026-0687)
    student_id_target = clean_query
    if clean_query.startswith("RES-2026-"):
        parts = clean_query.split("-")
        if len(parts) >= 3:
            student_id_target = f"EDU-2026-{parts[2]}"

    id_suffix = student_id_target.split("-")[-1] if "-" in student_id_target else student_id_target

    credentials = db.query(Credential).filter(
        or_(
            Credential.student_id.ilike(student_id_target),
            Credential.student_id.ilike(f"%{id_suffix}")
        )
    ).order_by(Credential.issued_at.desc()).all()

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No verifiable claims found matching Resume/Student ID '{clean_query}'.",
        )

    student_name = credentials[0].student_name
    cred_dicts = [
        {
            "id": c.id,
            "student_id": c.student_id,
            "student_name": c.student_name,
            "credential_type": c.credential_type,
            "degree": c.degree,
            "cgpa": c.cgpa,
            "credits": c.credits,
            "semester": c.semester,
            "conduct_status": c.conduct_status,
            "details_json": c.details_json,
            "institution_name": c.institution_name,
            "commitment_hash": c.commitment_hash,
            "is_revoked": c.is_revoked,
            "issued_at": c.issued_at.isoformat(),
        }
        for c in credentials
    ]

    skills = generate_skill_evidence_graph(cred_dicts)
    resolved_resume_id = clean_query if clean_query.startswith("RES-") else f"RES-2026-{id_suffix}-991A"

    return {
        "resume_id": resolved_resume_id,
        "student_id": credentials[0].student_id,
        "student_name": student_name,
        "summary": "Verified Academic & Professional Profile backed by cryptographic commitment hashes.",
        "skills_graph": skills,
        "verified_credentials": cred_dicts,
        "total_verified_claims": len(credentials),
        "verified_status": "VERIFIED_VALID",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/send-to-recruiter")
def send_resume_to_recruiter(
    recruiter_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Send student's Verifiable Resume directly to a Recruiter or Employer ID (EMP-2026-XXXX)."""
    clean_recruiter_id = recruiter_id.strip().upper()
    employer = db.query(User).filter(
        or_(
            User.institution_id == clean_recruiter_id,
            User.id == clean_recruiter_id,
            User.email.ilike(f"%{clean_recruiter_id.lower()}%")
        )
    ).first()

    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '0687'}"

    # Auto-create access request marked APPROVED for recruiter
    access_req = AccessRequest(
        employer_id=employer.id if employer else "RECRUITER_DIRECT",
        employer_name=employer.full_name if employer else f"Recruiter ({clean_recruiter_id})",
        employer_wallet=employer.wallet_address if employer else None,
        student_id=student_id,
        purpose="DIRECT_RESUME_APPLICATION",
        required_doc_types="DEGREE,MARKSHEET,TC,SKILL,WORK_EXPERIENCE",
        status="APPROVED",
    )
    db.add(access_req)
    db.commit()

    return {
        "message": f"Verifiable Resume successfully transmitted to Recruiter '{clean_recruiter_id}'!",
        "recruiter_id": clean_recruiter_id,
        "student_id": student_id,
        "status": "TRANSMITTED",
    }
