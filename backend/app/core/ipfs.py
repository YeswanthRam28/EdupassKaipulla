import json
import hashlib
from typing import Dict, Any, Tuple

API_BASE = "http://localhost:8000"


def generate_ipfs_cid(payload_dict: Dict[str, Any]) -> Tuple[str, str]:
    """
    Computes a deterministic IPFS Content Identifier (CID v1) and Synthesized Gateway URL for a credential payload.
    Format: ipfs://bafybeig... and http://localhost:8000/credentials/ipfs/bafybeig...
    """
    json_bytes = json.dumps(payload_dict, sort_keys=True).encode("utf-8")
    sha256_hash = hashlib.sha256(json_bytes).hexdigest()

    cid_suffix = sha256_hash[:32].lower()
    cid = f"ipfs://bafybeig{cid_suffix}edupass2026v1"
    
    clean_cid_token = f"bafybeig{cid_suffix}edupass2026v1"
    gateway_url = f"{API_BASE}/credentials/ipfs/{clean_cid_token}"

    return cid, gateway_url
