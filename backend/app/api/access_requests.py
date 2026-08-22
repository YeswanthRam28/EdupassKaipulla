from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.access_request import AccessRequest
from app.models.consent import ConsentGrant
from app.schemas.access_request import AccessRequestCreate, AccessRequestResponse, AccessRequestRespond
from app.dependencies.auth import get_current_user, require_role, require_any_role

router = APIRouter(prefix="/access-requests", tags=["Employer Access Requests"])


@router.post("/create", response_model=AccessRequestResponse, status_code=status.HTTP_201_CREATED)
def create_access_request(
    req_in: AccessRequestCreate,
    current_user: User = Depends(require_any_role([UserRole.EMPLOYER, UserRole.VERIFIER])),
    db: Session = Depends(get_db),
):
    """Employer sends formal credential access request to a student ID (EMPLOYER/VERIFIER role required)."""
    clean_student_id = req_in.student_id.strip().upper()

    new_req = AccessRequest(
        employer_id=current_user.id,
        employer_name=current_user.full_name,
        employer_wallet=current_user.wallet_address,
        student_id=clean_student_id,
        purpose=req_in.purpose.strip().upper(),
        required_doc_types=req_in.required_doc_types.strip().upper(),
        status="PENDING",
    )

    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    return AccessRequestResponse.model_validate(new_req)


@router.get("/employer-my-requests", response_model=List[AccessRequestResponse])
def get_employer_sent_requests(
    current_user: User = Depends(require_any_role([UserRole.EMPLOYER, UserRole.VERIFIER])),
    db: Session = Depends(get_db),
):
    """Retrieve all access requests sent by the authenticated employer/verifier."""
    requests = db.query(AccessRequest).filter(
        AccessRequest.employer_id == current_user.id
    ).order_by(AccessRequest.created_at.desc()).all()

    return [AccessRequestResponse.model_validate(r) for r in requests]


@router.get("/student-pending-requests", response_model=List[AccessRequestResponse])
def get_student_pending_requests(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Retrieve all incoming access requests received by the authenticated student."""
    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '0687'}"
    id_suffix = student_id.split("-")[-1].upper() if "-" in student_id else student_id

    requests = db.query(AccessRequest).filter(
        (AccessRequest.student_id == student_id) | (AccessRequest.student_id.ilike(f"%{id_suffix}"))
    ).order_by(AccessRequest.created_at.desc()).all()

    return [AccessRequestResponse.model_validate(r) for r in requests]


@router.post("/respond/{request_id}", response_model=AccessRequestResponse)
def respond_to_access_request(
    request_id: str,
    respond_in: AccessRequestRespond,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Student approves or rejects an incoming employer access request (STUDENT role required)."""
    access_req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not access_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found.",
        )

    new_status = respond_in.status.strip().upper()
    if new_status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either APPROVED or REJECTED.",
        )

    access_req.status = new_status

    # If APPROVED, automatically grant a 30-day consent token for the employer!
    if new_status == "APPROVED":
        expires = datetime.now(timezone.utc) + timedelta(days=30)
        consent = ConsentGrant(
            student_id=access_req.student_id,
            student_wallet=current_user.wallet_address,
            verifier_name=access_req.employer_name,
            verifier_wallet=access_req.employer_wallet,
            purpose=access_req.purpose,
            status="ACTIVE",
            expires_at=expires,
        )
        db.add(consent)

    db.commit()
    db.refresh(access_req)

    return AccessRequestResponse.model_validate(access_req)
