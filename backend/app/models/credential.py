import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Credential(Base):
    __tablename__ = "credentials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, nullable=False, index=True)
    student_name = Column(String, nullable=False)
    student_wallet = Column(String, nullable=True, index=True)
    credential_type = Column(String(50), nullable=False, default="DEGREE", index=True)
    degree = Column(String, nullable=False)
    cgpa = Column(Float, nullable=False, default=0.0)
    credits = Column(Integer, nullable=False, default=0)
    semester = Column(String(50), nullable=True)
    conduct_status = Column(String(50), nullable=True)
    details_json = Column(Text, nullable=True)
    institution_name = Column(String, nullable=False)
    issuer_id = Column(String, ForeignKey("users.id"), nullable=False)
    issuer_wallet = Column(String, nullable=True)
    commitment_hash = Column(String, nullable=False, unique=True, index=True)
    
    # Decentralized IPFS Storage & EduPass Cryptographic Master Signature
    ipfs_cid = Column(String, nullable=True)
    ipfs_gateway_url = Column(String, nullable=True)
    edupass_signature = Column(String, nullable=True)

    is_revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    issuer = relationship("User", backref="issued_credentials")
