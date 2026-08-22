from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class IssuerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, example="Stanford University")
    accreditation_code: str = Field(..., min_length=3, max_length=50, example="ACC-2026-STANFORD")
    country: str = Field(default="UNITED STATES", example="UNITED STATES")
    issuer_wallet: Optional[str] = Field(None, example="0x1234567890abcdef1234567890abcdef12345678")

    @field_validator("accreditation_code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        return v.strip().upper()


class IssuerResponse(BaseModel):
    id: str
    name: str
    accreditation_code: str
    country: str
    issuer_wallet: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
