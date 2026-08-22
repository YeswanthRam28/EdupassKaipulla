from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.credential import Credential
from app.models.issuer import Issuer
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/system", tags=["System Monitoring & Governance"])

START_TIME = datetime.now(timezone.utc)


@router.get("/health")
def get_system_health(db: Session = Depends(get_db)):
    """Public System Health and Database Connectivity Check."""
    try:
        # Test DB query
        user_count = db.query(User).count()
        cred_count = db.query(Credential).count()
        revoked_count = db.query(Credential).filter(Credential.is_revoked == True).count()
        issuer_count = db.query(Issuer).filter(Issuer.is_verified == True).count()

        uptime_seconds = int((datetime.now(timezone.utc) - START_TIME).total_seconds())

        return {
            "status": "HEALTHY",
            "service_name": "EduPass Decentralized Academic API",
            "database_connected": True,
            "database_engine": "Neon PostgreSQL Cloud",
            "uptime_seconds": uptime_seconds,
            "metrics": {
                "total_users": user_count,
                "total_credentials": cred_count,
                "revoked_credentials": revoked_count,
                "accredited_issuers": issuer_count,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System health degradation: {str(e)}",
        )
