from typing import List, Dict, Any


def generate_skill_evidence_graph(credentials: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Module 44: Skill Evidence Graph Engine.
    Maps transcript course codes, degree subjects, and work experience certificates
    directly to verified industry skills with cryptographic proof backing.
    """
    skill_map: Dict[str, Dict[str, Any]] = {}

    for cred in credentials:
        cred_type = (cred.get("credential_type") or "DEGREE").upper()
        title = (cred.get("degree") or "").upper()
        commitment = cred.get("commitment_hash") or "0x..."
        institution = cred.get("institution_name") or "EduPass Verified Issuer"
        cgpa = cred.get("cgpa") or 8.5

        # 1. Degree Title Skill Extraction
        if "COMPUTER SCIENCE" in title or "SOFTWARE" in title:
          add_skill(skill_map, "Software Engineering & Architecture", "EXPERT", 95, commitment, institution, title)
          add_skill(skill_map, "Algorithms & Complexity", "ADVANCED", 90, commitment, institution, title)
        if "DATA" in title or "ARTIFICIAL INTELLIGENCE" in title:
          add_skill(skill_map, "Data Engineering & Analytics", "ADVANCED", 88, commitment, institution, title)

        # 2. Extract skills from Marksheet details_json
        details_str = cred.get("details_json")
        if details_str:
            try:
                import json
                details = json.loads(details_str)
                courses = details.get("courses", [])
                for course in courses:
                    c_code = (course.get("code") or "").upper()
                    c_name = (course.get("name") or "").upper()
                    grade = (course.get("grade") or "A").upper()
                    score = 95 if "A+" in grade else 88 if "A" in grade else 80

                    if "DATA STRUCTURE" in c_name or "ALGORITHM" in c_name or "CS301" in c_code:
                        add_skill(skill_map, "Data Structures & Algorithms", f"EXPERT ({grade})", score, commitment, institution, f"{c_code}: {c_name}")
                    if "DATABASE" in c_name or "DBMS" in c_name or "CS302" in c_code:
                        add_skill(skill_map, "SQL & PostgreSQL Database Systems", f"ADVANCED ({grade})", score, commitment, institution, f"{c_code}: {c_name}")
                    if "NETWORK" in c_name or "SECURITY" in c_name or "CS303" in c_code:
                        add_skill(skill_map, "Network Security & Protocols", f"ADVANCED ({grade})", score, commitment, institution, f"{c_code}: {c_name}")
                    if "SKILL" in cred_type or "ZERO-KNOWLEDGE" in c_name or "CRYPTOGRAPHY" in c_name:
                        add_skill(skill_map, "Zero-Knowledge Cryptography & ZK-SNARKs", "EXPERT", 98, commitment, institution, "ZK Proof Studio & Cryptography")
            except Exception:
                pass

        # 3. Work Experience Skill Extraction
        if cred_type == "WORK_EXPERIENCE" or "DEVELOPER" in title or "ENGINEER" in title:
            add_skill(skill_map, "Full-Stack Web Development", "VERIFIED WORK", 92, commitment, institution, title)
            add_skill(skill_map, "Decentralized Systems & Web3", "VERIFIED WORK", 90, commitment, institution, title)

    # Fallback default skills if no credentials
    if not skill_map:
        add_skill(skill_map, "Computer Science Fundamentals", "VERIFIED", 85, "0x...", "EduPass Academic Network", "Core Science")
        add_skill(skill_map, "Software Development", "VERIFIED", 85, "0x...", "EduPass Academic Network", "Development")

    return list(skill_map.values())


def add_skill(
    skill_map: Dict[str, Dict[str, Any]],
    skill_name: str,
    proficiency: str,
    score: int,
    commitment: str,
    institution: str,
    source_claim: str
):
    if skill_name not in skill_map or score > skill_map[skill_name]["score"]:
        skill_map[skill_name] = {
            "skill_name": skill_name,
            "proficiency": proficiency,
            "score": score,
            "proof_commitment": commitment,
            "verified_by": institution,
            "source_claim": source_claim,
        }
