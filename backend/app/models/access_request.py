import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employer_id = Column(String, ForeignKey("users.id"), nullable=False)
    employer_name = Column(String(255), nullable=False)
    employer_wallet = Column(String(42), nullable=True)
    student_id = Column(String(50), nullable=False, index=True)
    purpose = Column(String(255), nullable=False, default="EMPLOYMENT_BACKGROUND_CHECK")
    required_doc_types = Column(String(255), nullable=False, default="DEGREE,MARKSHEET")
    status = Column(String(20), nullable=False, default="PENDING", index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employer = relationship("User", backref="sent_access_requests")
