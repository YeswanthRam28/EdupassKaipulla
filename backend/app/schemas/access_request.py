from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AccessRequestCreate(BaseModel):
    student_id: str = Field(..., min_length=2, max_length=50, example="EDU-2026-0687")
    purpose: str = Field(default="EMPLOYMENT_BACKGROUND_CHECK", example="EMPLOYMENT_BACKGROUND_CHECK")
    required_doc_types: str = Field(default="DEGREE,MARKSHEET", example="DEGREE,MARKSHEET")


class AccessRequestRespond(BaseModel):
    status: str = Field(..., example="APPROVED")  # APPROVED or REJECTED


class AccessRequestResponse(BaseModel):
    id: str
    employer_id: str
    employer_name: str
    employer_wallet: Optional[str] = None
    student_id: str
    purpose: str
    required_doc_types: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
