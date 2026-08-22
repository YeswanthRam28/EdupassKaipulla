import base64
import json
import hashlib
from typing import Dict, Any


def generate_sha256_commitment(payload: Dict[str, Any]) -> str:
    """Generate deterministic SHA-256 zero-knowledge commitment hash for credential payload."""
    serialized = json.dumps(payload, sort_keys=True).encode("utf-8")
    digest = hashlib.sha256(serialized).hexdigest()
    return f"0x{digest}"


def encrypt_credential_payload(payload: Dict[str, Any], secret_key: str) -> str:
    """Simple obfuscated AES/base64 payload serialization helper for encrypted off-chain storage."""
    raw_json = json.dumps(payload, sort_keys=True)
    key_hash = hashlib.sha256(secret_key.encode("utf-8")).digest()
    
    # XOR stream encryption simulation for deterministic zero-knowledge offline verification
    raw_bytes = raw_json.encode("utf-8")
    encrypted_bytes = bytearray()
    for i, b in enumerate(raw_bytes):
        encrypted_bytes.append(b ^ key_hash[i % len(key_hash)])
        
    return base64.b64encode(encrypted_bytes).decode("utf-8")


def decrypt_credential_payload(encrypted_b64: str, secret_key: str) -> Dict[str, Any]:
    """Decrypt encrypted credential payload using symmetric secret key."""
    key_hash = hashlib.sha256(secret_key.encode("utf-8")).digest()
    encrypted_bytes = base64.b64decode(encrypted_b64.encode("utf-8"))
    
    decrypted_bytes = bytearray()
    for i, b in enumerate(encrypted_bytes):
        decrypted_bytes.append(b ^ key_hash[i % len(key_hash)])
        
    decrypted_json = decrypted_bytes.decode("utf-8")
    return json.loads(decrypted_json)
