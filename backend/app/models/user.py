import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from app.db.session import Base


class UserRole(str, Enum):
    STUDENT = "STUDENT"
    INSTITUTION = "INSTITUTION"
    VERIFIER = "VERIFIER"
    EMPLOYER = "EMPLOYER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    wallet_address = Column(String, unique=True, index=True, nullable=True)
    student_id = Column(String, nullable=True, index=True)
    institution_id = Column(String, nullable=True, index=True)
    institution_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
