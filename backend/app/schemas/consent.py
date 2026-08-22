from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ConsentCreate(BaseModel):
    verifier_name: str = Field(..., min_length=2, max_length=150, example="Google Mobility Team")
    verifier_wallet: Optional[str] = Field(None, example="0x1234567890abcdef1234567890abcdef12345678")
    purpose: str = Field(default="EMPLOYMENT_VERIFICATION", example="EMPLOYMENT_VERIFICATION")
    valid_days: int = Field(default=30, ge=1, le=365, example=30)


class ConsentResponse(BaseModel):
    id: str
    student_id: str
    student_wallet: Optional[str] = None
    verifier_name: str
    verifier_wallet: Optional[str] = None
    purpose: str
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
