from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CredentialCreate(BaseModel):
    student_id: str = Field(..., min_length=2, max_length=50, example="EDU-2026-9283")
    student_name: str = Field(..., min_length=2, max_length=100, example="Jane Doe")
    student_wallet: Optional[str] = Field(None, example="0x1234567890abcdef1234567890abcdef12345678")
    degree: str = Field(..., min_length=2, max_length=150, example="B.Tech Computer Science")
    cgpa: float = Field(..., ge=0.0, le=10.0, example=8.47)
    credits: int = Field(..., ge=1, le=500, example=142)

    @field_validator("student_id", "degree")
    @classmethod
    def clean_strings(cls, v: str) -> str:
        return v.strip()


class CredentialResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_wallet: Optional[str] = None
    degree: str
    cgpa: float
    credits: int
    institution_name: str
    issuer_id: str
    issuer_wallet: Optional[str] = None
    commitment_hash: str
    is_revoked: bool = False
    revoked_at: Optional[datetime] = None
    issued_at: datetime

    class Config:
        from_attributes = True
