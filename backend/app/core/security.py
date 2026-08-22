import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from jose import jwt, JWTError
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash password using SHA-256 HMAC salt for guaranteed Python 3.13 compatibility."""
    salt = settings.SECRET_KEY.encode('utf-8')
    return hmac.new(salt, password.encode('utf-8'), hashlib.sha256).hexdigest()


# Alias for backwards compatibility
get_password_hash = hash_password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against stored hash."""
    return hmac.compare_digest(hash_password(plain_password), hashed_password)


def create_access_token(
    subject: Union[str, Any], role: Optional[str] = None, expires_delta: Optional[timedelta] = None
) -> str:
    """Generate JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    if role:
        to_encode["role"] = str(role)
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
