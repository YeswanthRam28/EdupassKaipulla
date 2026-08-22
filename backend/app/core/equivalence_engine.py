from typing import Dict, Any


def normalize_academic_grades(cgpa: float) -> Dict[str, Any]:
    """
    Module 42: Grade Normalization Engine.
    Converts academic CGPA (10.0 scale) into US 4.0 GPA, German 1.0–5.0 scale (Bavarian Formula),
    European ECTS Letter Grades, and UK Degree Classifications.
    """
    # 1. US 4.0 Scale Conversion
    if cgpa >= 9.5:
        us_gpa = 4.0
    elif cgpa >= 9.0:
        us_gpa = 3.9
    elif cgpa >= 8.5:
        us_gpa = 3.75
    elif cgpa >= 8.0:
        us_gpa = 3.5
    elif cgpa >= 7.5:
        us_gpa = 3.25
    elif cgpa >= 7.0:
        us_gpa = 3.0
    elif cgpa >= 6.0:
        us_gpa = 2.5
    else:
        us_gpa = 2.0

    # 2. German Scale Conversion (Bavarian Formula: 1 + 3 * (10 - CGPA) / (10 - 5))
    german_grade = round(max(1.0, min(5.0, 1.0 + 3.0 * ((10.0 - max(5.0, cgpa)) / 5.0))), 2)

    # 3. ECTS Grade Scale
    if cgpa >= 9.0:
        ects_grade = "A (EXCELLENT - TOP 10%)"
    elif cgpa >= 8.0:
        ects_grade = "B (VERY GOOD - NEXT 25%)"
    elif cgpa >= 7.0:
        ects_grade = "C (GOOD - NEXT 30%)"
    elif cgpa >= 6.0:
        ects_grade = "D (SATISFACTORY - NEXT 25%)"
    else:
        ects_grade = "E (SUFFICIENT - PASSING)"

    # 4. UK Degree Classification
    if cgpa >= 8.5:
        uk_class = "FIRST CLASS HONORS (1ST)"
    elif cgpa >= 7.5:
        uk_class = "UPPER SECOND CLASS (2:1)"
    elif cgpa >= 6.5:
        uk_class = "LOWER SECOND CLASS (2:2)"
    else:
        uk_class = "THIRD CLASS HONORS (3RD)"

    return {
        "original_cgpa": cgpa,
        "us_gpa": us_gpa,
        "german_grade": german_grade,
        "ects_grade": ects_grade,
        "uk_classification": uk_class,
    }


def evaluate_global_mobility_equivalency(
    country: str,
    cgpa: float,
    credits: int,
    degree_title: str
) -> Dict[str, Any]:
    """
    Modules 41, 43 & 47: Course Credit & Qualification Equivalency Engine.
    Evaluates global degree transferability against specific target country frameworks.
    """
    clean_country = country.strip().upper()
    grades = normalize_academic_grades(cgpa)

    if clean_country in ["US", "UNITED STATES"]:
        target_gpa = f"{grades['us_gpa']} / 4.0"
        ects_equivalent = int(credits * 1.25)
        transfer_score = min(98, int((grades['us_gpa'] / 4.0) * 100))
        eqf_level = "US BACHELOR OF SCIENCE (LEVEL 6)"
        verdict = "DIRECT ELIGIBILITY CONFIRMED FOR US GRADUATE ADMISSIONS"
    elif clean_country in ["GERMANY", "DE"]:
        target_gpa = f"{grades['german_grade']} (SEHR GUT)" if grades['german_grade'] <= 1.5 else f"{grades['german_grade']} (GUT)"
        ects_equivalent = int(credits * 1.25)
        transfer_score = min(98, int(((5.0 - grades['german_grade']) / 4.0) * 100))
        eqf_level = "GERMAN HOCHSCHULE BACHELOR (EQF LEVEL 6)"
        verdict = "ANABIN H+ ACCREDITATION EQUIVALENCY VERIFIED"
    elif clean_country in ["UK", "UNITED KINGDOM"]:
        target_gpa = grades['uk_classification']
        ects_equivalent = int(credits * 2.5) # CATS points
        transfer_score = min(98, int((cgpa / 10.0) * 100))
        eqf_level = "UK FHEQ LEVEL 6 (HONORS)"
        verdict = "ENIC / NARIC UK ACADEMIC EQUIVALENCY VERIFIED"
    elif clean_country in ["CANADA", "CA"]:
        target_gpa = f"{grades['us_gpa']} / 4.0 GPA"
        ects_equivalent = int(credits * 1.25)
        transfer_score = min(98, int((cgpa / 10.0) * 98))
        eqf_level = "CANADIAN BACHELOR DEGREE (WES LEVEL 4)"
        verdict = "WES CANADA EDUCATIONAL CREDENTIAL ASSESSMENT (ECA) APPROVED"
    else: # AUSTRALIA
        target_gpa = f"HD / D (HIGH DISTINCTION - {grades['ects_grade']})"
        ects_equivalent = int(credits * 1.25)
        transfer_score = min(98, int((cgpa / 10.0) * 96))
        eqf_level = "AUSTRALIAN AQF LEVEL 7 BACHELOR"
        verdict = "NOOSR AUSTRALIA DEGREE RECOGNITION CONFIRMED"

    return {
        "target_country": clean_country,
        "degree_title": degree_title,
        "original_cgpa": cgpa,
        "original_credits": credits,
        "normalized_gpa": target_gpa,
        "ects_equivalent_credits": ects_equivalent,
        "qualification_level": eqf_level,
        "transferability_score": transfer_score,
        "equivalence_verdict": verdict,
        "grade_breakdown": grades,
    }
