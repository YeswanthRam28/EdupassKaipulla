import hmac
import hashlib
import json
from typing import Dict, Any, Optional
from app.core.config import settings

EDUPASS_MASTER_PREFIX = "EDUPASS_CRYPTOGRAPHIC_MASTER_SIGNATURE_2026"


def generate_edupass_signature(
    commitment_hash: str,
    student_id: str,
    credential_type: str,
    degree: str,
    cgpa: float,
    credits: int,
    ipfs_cid: str,
    issued_at_str: str,
) -> str:
    """
    Generates an untamperable EduPass System Master Cryptographic Signature.
    Pairs system secret key with deterministic credential attributes.
    """
    raw_bytes = f"{EDUPASS_MASTER_PREFIX}:{commitment_hash}:{student_id}:{credential_type}:{degree}:{cgpa}:{credits}:{ipfs_cid}:{issued_at_str}".encode("utf-8")
    secret_bytes = settings.SECRET_KEY.encode("utf-8")
    
    hmac_digest = hmac.new(secret_bytes, raw_bytes, hashlib.sha256).hexdigest()
    return f"0xedupass_sig_{hmac_digest[:32].upper()}"


def verify_edupass_signature(cred_data: Dict[str, Any]) -> bool:
    """
    Verifies the integrity of an EduPass credential.
    Returns True if 100% untampered, or False if tampered or invalid signature.
    """
    expected_sig = cred_data.get("edupass_signature")
    if not expected_sig or not expected_sig.startswith("0xedupass_sig_"):
        return False

    computed_sig = generate_edupass_signature(
        commitment_hash=cred_data.get("commitment_hash", ""),
        student_id=cred_data.get("student_id", ""),
        credential_type=cred_data.get("credential_type", "DEGREE"),
        degree=cred_data.get("degree", ""),
        cgpa=float(cred_data.get("cgpa", 0.0)),
        credits=int(cred_data.get("credits", 0)),
        ipfs_cid=cred_data.get("ipfs_cid", ""),
        issued_at_str=str(cred_data.get("issued_at", "")),
    )

    return hmac.compare_digest(computed_sig, expected_sig)
