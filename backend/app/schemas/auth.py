from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole

PublicUserRole = Literal["STUDENT", "INSTITUTION", "VERIFIER", "EMPLOYER"]


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, example="SecretPassword123")
    full_name: str = Field(..., min_length=2, example="Jane Doe")
    role: PublicUserRole = Field(default="STUDENT", example="STUDENT")
    wallet_address: Optional[str] = Field(None, example="0x1234567890abcdef1234567890abcdef12345678")
    student_id: Optional[str] = Field(None, example="EDU-2026-9283")
    institution_id: Optional[str] = Field(None, example="INST-STANFORD")
    institution_name: Optional[str] = Field(None, example="Stanford University")

    @field_validator("full_name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be blank")
        return v.strip()


class WalletOnboard(BaseModel):
    wallet_address: str = Field(..., min_length=10, example="0x1234567890abcdef1234567890abcdef12345678")
    full_name: str = Field(..., min_length=2, example="Jane Doe")
    role: PublicUserRole = Field(..., example="STUDENT")
    student_id: Optional[str] = Field(None, example="EDU-2026-9283")
    institution_id: Optional[str] = Field(None, example="INST-STANFORD")
    institution_name: Optional[str] = Field(None, example="Stanford University")

    @field_validator("wallet_address")
    @classmethod
    def clean_wallet(cls, v: str) -> str:
        return v.strip().lower()


class WalletLogin(BaseModel):
    wallet_address: str = Field(..., min_length=10, example="0x1234567890abcdef1234567890abcdef12345678")

    @field_validator("wallet_address")
    @classmethod
    def clean_wallet(cls, v: str) -> str:
        return v.strip().lower()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class MobileLoginRequest(BaseModel):
    identifier: str = Field(..., example="student@university.edu or EDU-2026-0687 or 0x...")
    password: Optional[str] = Field(None, example="SecretPassword123")
    device_id: Optional[str] = Field(None, example="ANDROID_HW_ID_991A")
    device_name: Optional[str] = Field(None, example="Pixel 8 Pro")


class MobileKeyVerifyRequest(BaseModel):
    identifier: str = Field(..., example="EDU-2026-0687 or student@university.edu")
    mobile_key: str = Field(..., example="EDUPASS-KEY-991A-8819-2026")
    biometric_verified: bool = Field(default=True, example=True)
    device_id: Optional[str] = Field(None, example="ANDROID_HW_ID_991A")


class MobileQRAuthRequest(BaseModel):
    qr_session_id: str = Field(..., example="qr_sess_88192")
    student_id: str = Field(..., example="EDU-2026-0687")


class UserResponse(BaseModel):
    id: str
    email: str
    wallet_address: Optional[str] = None
    student_id: Optional[str] = None
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    full_name: str
    role: UserRole
    mobile_access_key: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
