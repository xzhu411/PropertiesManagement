"""
Rule-based FHA pre-check — deterministic, auditable.
Runs before Claude to catch obvious compliance risks.
Claude then validates contextually on top of this.
"""

PROTECTED_CLASSES = [
    "Race", "Color", "National Origin", "Religion",
    "Sex", "Familial Status", "Disability", "Source of Income (local)",
]

# Cities/states with source-of-income (SOI) anti-discrimination laws
SOI_JURISDICTIONS = {
    "Austin, TX": "Austin City Code § 5-11-41 (2014)",
    "New York, NY": "NYC Admin. Code § 8-107(5)",
    "Chicago, IL": "Chicago Fair Housing Ordinance (MCC § 5-8-030)",
    "San Francisco, CA": "SF Admin. Code § 12A",
    "Seattle, WA": "Seattle Open Housing Ordinance",
    "Washington, DC": "DC Human Rights Act § 2-1402.21",
}


def check_fha_risks(application: dict, property_city: str = "") -> dict:
    """
    Returns structured FHA risk assessment.
    Checks income sources, notes, and applicant profile for protected class exposure.
    """
    flags = []
    income_sources = application.get("income_sources", [])
    notes = application.get("additional_notes", "") or ""
    combined_text = " ".join(income_sources) + " " + notes

    # Check 1: Section 8 / Housing Choice Voucher — triggers SOI protections
    soi_keywords = ["section 8", "housing choice voucher", "housing voucher", "hud voucher"]
    if any(kw in combined_text.lower() for kw in soi_keywords):
        jurisdiction_citation = SOI_JURISDICTIONS.get(property_city, "")
        citations = ["42 U.S.C. § 3604 (Fair Housing Act)"]
        if jurisdiction_citation:
            citations.append(jurisdiction_citation)

        flags.append({
            "trigger": "Application includes Section 8 / Housing Choice Voucher income",
            "protected_class": "Source of Income (local)",
            "legal_citation": "; ".join(citations),
            "compliant_alternative": (
                f"Evaluate total combined income (wages + voucher subsidy) against the 3x rent standard. "
                f"{'Rejection of Section 8 vouchers is prohibited in ' + property_city + '.' if jurisdiction_citation else 'Check local ordinances before rejecting voucher holders.'}"
            ),
        })

    # Check 2: Disability accommodation language
    disability_keywords = ["disability", "disabled", "wheelchair", "ada", "accommodation", "accessible"]
    if any(kw in combined_text.lower() for kw in disability_keywords):
        flags.append({
            "trigger": "Application or notes reference disability or accommodation needs",
            "protected_class": "Disability",
            "legal_citation": "42 U.S.C. § 3604(f); HUD 24 C.F.R. § 100.202",
            "compliant_alternative": (
                "Reasonable accommodations must be provided under the FHA. "
                "Do not deny based on disability. Evaluate standard financial criteria only."
            ),
        })

    # Check 3: Familial status (children/pregnancy signals)
    familial_keywords = ["pregnant", "expecting", "children", "child", "kids", "family"]
    if any(kw in combined_text.lower() for kw in familial_keywords):
        flags.append({
            "trigger": "Application references family status or children",
            "protected_class": "Familial Status",
            "legal_citation": "42 U.S.C. § 3604(b); HUD 24 C.F.R. § 100.65",
            "compliant_alternative": (
                "Familial status is a protected class. Apply occupancy standards uniformly (HUD recommends "
                "minimum 2 persons per bedroom as a general guideline). Do not reject for having children."
            ),
        })

    # Check 4: National origin signals (names, language references in notes)
    # We only flag if notes explicitly mention national origin in a rejection context
    national_origin_keywords = ["foreign", "immigrant", "visa", "not citizen", "non-citizen"]
    if any(kw in combined_text.lower() for kw in national_origin_keywords):
        flags.append({
            "trigger": "Application notes reference citizenship or national origin",
            "protected_class": "National Origin",
            "legal_citation": "42 U.S.C. § 3604(a); HUD 24 C.F.R. § 100.60",
            "compliant_alternative": (
                "National origin is a protected class. Non-citizen status alone is not a lawful basis for "
                "denial. Evaluate financial qualifications (income, credit) using standard criteria."
            ),
        })

    is_compliant = len(flags) == 0
    if is_compliant:
        overall = "No protected class exposure identified. Rejection rationale, if any, may proceed on standard financial grounds."
    else:
        overall = (
            f"{len(flags)} FHA compliance flag(s) detected. Review flagged items before issuing any adverse action notice. "
            "Consult legal counsel if denial is being considered."
        )

    return {
        "is_compliant": is_compliant,
        "flags": flags,
        "overall_assessment": overall,
    }
