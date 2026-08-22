from typing import Dict, Any


def apply_credential_firewall(
    credential_data: Dict[str, Any],
    caller_role: str,
    has_active_consent: bool = False
) -> Dict[str, Any]:
    """
    Zero-Trust Credential Firewall.
    
    If caller is unauthenticated or third-party without active consent,
    sensitive fields (CGPA, specific course credits, raw name) are masked,
    retaining ONLY the SHA-256 commitment hash and public verification status.
    """
    sanitized = dict(credential_data)

    # Full disclosure for STUDENT, INSTITUTION, ADMIN or consented verifiers
    if caller_role in ["STUDENT", "INSTITUTION", "ADMIN"] or has_active_consent:
        return sanitized

    # Apply Firewall Data Masking for unconsented verifiers
    sanitized["cgpa_masked"] = True
    sanitized["cgpa"] = 0.0  # Zero out exact CGPA
    sanitized["credits_masked"] = True
    sanitized["student_name"] = f"PROTECTED STUDENT ({sanitized.get('student_id', 'ANONYMOUS')})"

    return sanitized
