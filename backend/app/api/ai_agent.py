from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User
from app.models.credential import Credential
from app.core.ai_mobility_agent import (
    chat_with_mobility_agent,
    extract_requirements_from_text,
    evaluate_credential_against_requirements,
    plan_zk_proof_package,
)
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/ai-agent", tags=["AI Mobility Agent & Requirement Extractor (Groq Llama 8B)"])


class ChatRequest(BaseModel):
    message: str = Field(..., example="What are the admission requirements and GPA conversions for US computer science master's programs?")
    history: Optional[List[Dict[str, str]]] = Field(default=[], example=[])


class ExtractEvaluateRequest(BaseModel):
    raw_admission_text: str = Field(..., example="Applicants must hold a Bachelor of Science in Computer Science with a minimum GPA of 3.0 and at least 120 credit units, including Data Structures and Database Systems.")


@router.post("/chat")
def ai_agent_chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Module 26: AI Mobility Agent Conversational Assistant.
    Powered by Groq Llama 8B (llama-3.1-8b-instant / llama3-8b-8192).
    """
    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '0687'}"
    id_suffix = student_id.split("-")[-1].upper() if "-" in student_id else student_id

    credentials = db.query(Credential).filter(
        or_(Credential.student_id.ilike(student_id), Credential.student_id.ilike(f"%{id_suffix}"))
    ).all()

    top_cred = credentials[0] if credentials else None
    student_ctx = {
        "full_name": current_user.full_name,
        "student_id": student_id,
        "cgpa": top_cred.cgpa if top_cred else 9.37,
        "credits": top_cred.credits if top_cred else 142,
    }

    response_text = chat_with_mobility_agent(
        user_message=req.message,
        history=req.history or [],
        student_context=student_ctx,
    )

    return {
        "reply": response_text,
        "agent_model": "Groq Llama 8B (llama-3.1-8b-instant)",
        "student_id": student_id,
    }


@router.post("/extract-and-evaluate")
def extract_requirements_and_evaluate(
    req: ExtractEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Modules 27, 28 & 29: Smart Admission Text Extractor & Student Eligibility Evaluator.
    Parses raw admission postings into structured requirements and evaluates student credential match.
    """
    if not req.raw_admission_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Raw admission text cannot be empty.",
        )

    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '0687'}"
    id_suffix = student_id.split("-")[-1].upper() if "-" in student_id else student_id

    credentials = db.query(Credential).filter(
        or_(Credential.student_id.ilike(student_id), Credential.student_id.ilike(f"%{id_suffix}"))
    ).order_by(Credential.issued_at.desc()).all()

    cred_dicts = [
        {
            "degree": c.degree,
            "cgpa": c.cgpa,
            "credits": c.credits,
            "institution_name": c.institution_name,
            "commitment_hash": c.commitment_hash,
        }
        for c in credentials
    ] if credentials else [{"degree": "B.Tech Computer Science", "cgpa": 9.37, "credits": 142, "institution_name": "EduPass University"}]

    extracted_reqs = extract_requirements_from_text(req.raw_admission_text)
    evaluation = evaluate_credential_against_requirements(cred_dicts, extracted_reqs)
    zk_plan = plan_zk_proof_package(extracted_reqs, cred_dicts)

    return {
        "extracted_requirements": extracted_reqs,
        "evaluation": evaluation,
        "zk_proof_plan": zk_plan,
        "student_id": student_id,
        "agent_model": "Groq Llama 8B (llama-3.1-8b-instant)",
    }


@router.post("/plan-zk-proof")
def plan_zk_proof(
    req: ExtractEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Module 30: ZK Proof Package Planner.
    Auto-recommends optimal Zero-Knowledge proof claims for admission posting.
    """
    student_id = current_user.student_id or f"EDU-2026-{current_user.wallet_address[-4:].upper() if current_user.wallet_address else '0687'}"
    id_suffix = student_id.split("-")[-1].upper() if "-" in student_id else student_id

    credentials = db.query(Credential).filter(
        or_(Credential.student_id.ilike(student_id), Credential.student_id.ilike(f"%{id_suffix}"))
    ).all()

    cred_dicts = [{"degree": c.degree, "cgpa": c.cgpa, "credits": c.credits} for c in credentials] if credentials else [{"degree": "B.Tech Computer Science", "cgpa": 9.37, "credits": 142}]
    extracted_reqs = extract_requirements_from_text(req.raw_admission_text)
    zk_plan = plan_zk_proof_package(extracted_reqs, cred_dicts)

    return zk_plan
