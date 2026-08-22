from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import UserResponse
from app.dependencies.auth import get_current_user, require_any_role

router = APIRouter(prefix="/users", tags=["User Roster Management"])


@router.get("/students", response_model=List[UserResponse])
def get_registered_students(
    current_user: User = Depends(require_any_role([UserRole.INSTITUTION, UserRole.ADMIN, UserRole.VERIFIER, UserRole.EMPLOYER])),
    db: Session = Depends(get_db),
):
    """Retrieve roster list of all registered student accounts."""
    students = db.query(User).filter(User.role == UserRole.STUDENT).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(s) for s in students]
