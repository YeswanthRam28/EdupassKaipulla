import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.db.session import Base


class ConsentGrant(Base):
    __tablename__ = "consent_grants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(50), nullable=False, index=True)
    student_wallet = Column(String(42), nullable=True, index=True)
    verifier_name = Column(String(255), nullable=False)
    verifier_wallet = Column(String(42), nullable=True)
    purpose = Column(String(255), nullable=False, default="EMPLOYMENT_VERIFICATION")
    status = Column(String(20), nullable=False, default="ACTIVE")
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
