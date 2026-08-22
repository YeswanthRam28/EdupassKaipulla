import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from app.db.session import Base


class Issuer(Base):
    __tablename__ = "issuers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    accreditation_code = Column(String(100), unique=True, index=True, nullable=False)
    country = Column(String(100), nullable=False, default="UNITED STATES")
    issuer_wallet = Column(String(42), unique=True, index=True, nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
