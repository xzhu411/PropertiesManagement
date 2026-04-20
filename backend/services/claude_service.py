import json
import os
import anthropic
from config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_STRUCTURED = """You are a residential asset management underwriting engine for a private equity real estate firm.
Your analysis must follow institutional underwriting standards and Fair Housing Act compliance requirements.

You MUST respond with valid JSON matching EXACTLY this schema. No prose outside the JSON object. No markdown fences.

{
  "recommendation": "APPROVED" | "CONDITIONAL" | "DENIED",
  "confidence_score": float (0.0-1.0),
  "income_analysis": {
    "monthly_gross": float,
    "monthly_rent": float,
    "ratio": float,
    "meets_3x_standard": bool,
    "income_stability_score": float (0.0-1.0),
    "income_stability_rationale": "string"
  },
  "risk_flags": [
    {
      "category": "INCOME" | "CREDIT" | "RENTAL_HISTORY" | "EMPLOYMENT" | "BEHAVIORAL",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "flag": "concise label string",
      "detail": "one sentence explanation",
      "mitigant": "how to offset this risk, or null"
    }
  ],
  "fha_compliance": {
    "is_compliant": bool,
    "flags": [
      {
        "trigger": "string",
        "protected_class": "string",
        "legal_citation": "string",
        "compliant_alternative": "string"
      }
    ],
    "overall_assessment": "string"
  },
  "npv_model": {
    "monthly_rent": float,
    "analysis_period_months": 12,
    "applicant": {
      "vacancy_probability_pct": float,
      "expected_vacancy_cost": float,
      "eviction_probability_pct": float,
      "expected_eviction_cost": float,
      "expected_net_revenue_12mo": float
    },
    "market_average": {
      "vacancy_probability_pct": float,
      "expected_vacancy_cost": float,
      "eviction_probability_pct": float,
      "expected_eviction_cost": float,
      "expected_net_revenue_12mo": float
    },
    "delta_vs_market": float,
    "delta_pct": float,
    "npv_assumptions": {
      "vacancy_cost_per_month": float,
      "eviction_cost_estimate": float,
      "discount_rate_annual_pct": float
    }
  },
  "conditions": ["string"] | null,
  "summary_headline": "one punchy sentence max 12 words"
}"""

SYSTEM_NARRATIVE = """You are PLAZA INTELLIGENCE — an AI underwriting agent for a residential private equity asset manager.
Write as a sharp institutional analyst presenting to an investment committee.
Use a terminal/report style: structured, numbered, clear section headers.
Show your math inline. Maximum 350 words. No markdown. Use plain text only."""


def _build_user_prompt(application: dict, property_name: str, city: str, npv_pre: dict, fha_pre: dict) -> str:
    return f"""Underwrite the following rental application.

PROPERTY: {property_name} ({city})
UNIT TYPE: {application.get('unit_type', '1BR')} | Monthly Rent: ${application['target_unit_rent']:,.0f}

APPLICANT PROFILE:
- Name: {application['name']}
- Monthly Gross Income: ${application['monthly_gross_income']:,.0f}
- Income Sources: {'; '.join(application['income_sources'])}
- Employment Duration (current job): {application['employment_months']} months
- Credit Score Range: {application['credit_score_range']}
- Rental History: {application['rental_history_months']} months
- Previous Evictions: {application['previous_evictions']}
- Late Payments (last 12 months): {application['late_payments_12mo']}
- References: {application['references']}
- Additional Notes: {application.get('additional_notes') or 'None'}

PRE-COMPUTED FINANCIAL MODEL (use these exact numbers in your npv_model):
- Vacancy Probability: {npv_pre['applicant']['vacancy_probability_pct']}%
- Eviction Probability: {npv_pre['applicant']['eviction_probability_pct']}%
- Expected Net Revenue (12mo): ${npv_pre['applicant']['expected_net_revenue_12mo']:,.0f}
- Market Average Net Revenue (12mo): ${npv_pre['market_average']['expected_net_revenue_12mo']:,.0f}
- Delta vs Market: ${npv_pre['delta_vs_market']:,.0f} ({npv_pre['delta_pct']:+.1f}%)
- Assumptions: Vacancy cost ${npv_pre['npv_assumptions']['vacancy_cost_per_month']:,.0f}, Eviction cost ${npv_pre['npv_assumptions']['eviction_cost_estimate']:,.0f}

PRE-COMPUTED FHA CHECK:
- Compliant: {fha_pre['is_compliant']}
- Flags detected: {len(fha_pre['flags'])}
- Assessment: {fha_pre['overall_assessment']}
- Specific flags: {json.dumps(fha_pre['flags'])}

UNDERWRITING STANDARDS:
- Income-to-rent minimum: 3.0x | Credit minimum: 650 (conditional: 580-649)
- Max late payments for approval: 1 (conditional: 2)
- Employment < 6 months = flag for stability

Use the pre-computed NPV numbers exactly. Use the pre-computed FHA flags exactly (do not invent new ones).
Generate additional risk_flags based on your analysis. Return valid JSON only."""


def _build_narrative_prompt(application: dict, result: dict, property_name: str) -> str:
    rent = application['target_unit_rent']
    delta = result['npv_model']['delta_vs_market']
    delta_pct = result['npv_model']['delta_pct']
    rec = result['recommendation']
    fha_clean = result['fha_compliance']['is_compliant']

    return f"""Write the investment committee underwriting narrative for this screening.

SCREENING RESULT: {rec} (confidence: {result['confidence_score']:.0%})
PROPERTY: {property_name} | UNIT: {application.get('unit_type', '1BR')} | RENT: ${rent:,.0f}/mo
APPLICANT: {application['name']}
INCOME RATIO: {result['income_analysis']['ratio']:.2f}x (3.0x standard)
RISK FLAGS: {len(result['risk_flags'])} total
FHA STATUS: {'COMPLIANT' if fha_clean else 'FLAGGED — ' + str(len(result['fha_compliance']['flags'])) + ' issue(s)'}
12-MONTH NPV DELTA: ${delta:+,.0f} ({delta_pct:+.1f}% vs. market average)
CONDITIONS: {', '.join(result['conditions']) if result.get('conditions') else 'None'}

Structure your response EXACTLY as:

PLAZA INTELLIGENCE — UNDERWRITING SUMMARY
{property_name} | {application.get('unit_type', '1BR')} | ${rent:,.0f}/mo

1. RECOMMENDATION
[One decisive sentence with recommendation and confidence.]

2. INCOME & CREDIT PROFILE
[3-4 sentences. Show the ratio math. Assess income source quality. Note credit tier.]

3. KEY RISK FLAGS
[Bullet each flag. One line each. Lead with severity.]

4. FHA COMPLIANCE
[One sentence. State clean or flagged. If flagged, name the protected class.]

5. 12-MONTH NPV IMPACT
[Show the math: vacancy × cost + eviction × cost = net revenue. Compare to market. State the delta.]

6. CONDITIONS / MITIGANTS
[Bullet list, or "None required."]

Write it now. No markdown. Plain text only."""


def run_structured_screening(application: dict, property_name: str, city: str, npv_pre: dict, fha_pre: dict) -> dict:
    """Call 1: JSON schema output — fast, reliable, populates all UI panels."""
    message = client.messages.create(
        model=settings.model,
        max_tokens=2500,
        system=SYSTEM_STRUCTURED,
        messages=[{
            "role": "user",
            "content": _build_user_prompt(application, property_name, city, npv_pre, fha_pre)
        }],
    )
    raw = message.content[0].text.strip()
    # Strip any accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


_risk_alerts_cache: list | None = None

SYSTEM_RISK_ALERTS = """You are a residential asset management analyst for a private equity real estate firm.
Analyze the portfolio data and generate risk alerts as a JSON array.

You MUST respond with ONLY a valid JSON array. No prose, no markdown fences, no explanation outside the array.

Each alert object must match this schema exactly:
{
  "level": "URGENT" | "WATCH" | "INFO",
  "property": "exact property name string",
  "unit": "unit id string or null for property-level alerts",
  "message": "one concise sentence, max 120 chars",
  "action": "one recommended action, max 60 chars",
  "analysis": "2-4 sentences with specific numbers from the data"
}

Level definitions:
- URGENT: immediate financial or legal risk requiring action now
- WATCH: developing risk to monitor in next 30 days
- INFO: opportunity or low-priority observation

Generate 5-8 alerts total. Be specific — use actual numbers from the data."""


def generate_risk_alerts(properties: list, leases: list) -> list:
    """Generate AI risk alerts from portfolio data. Result cached in memory for the session."""
    global _risk_alerts_cache
    if _risk_alerts_cache is not None:
        return _risk_alerts_cache

    # Build concise property summaries
    prop_summaries = [
        {
            "name": p["name"],
            "city": p["city"],
            "units": p["units"],
            "occupancy_pct": p["financials"]["physical_occupancy_pct"],
            "collection_rate_pct": p["financials"]["collection_rate_pct"],
            "noi_annual": p["financials"]["noi_annual"],
            "cap_rate": p["financials"]["cap_rate"],
            "dscr": p["debt"]["dscr"],
            "loan_balance": p["debt"]["loan_balance"],
            "annual_debt_service": p["debt"]["annual_debt_service"],
            "interest_rate_pct": p["debt"]["interest_rate_pct"],
            "maturity_date": p["debt"]["maturity_date"],
            "lease_expirations_90d": p["lease_expirations_90d"],
            "rent_vs_market_pct": p["rent_vs_market_pct"],
        }
        for p in properties
    ]

    # Only pass critical/high urgency leases to keep prompt concise
    urgent_leases = [
        {
            "unit": l["unit"],
            "property": l["property"],
            "tenant": l["tenant"],
            "rent": l["rent"],
            "expires": l["expires"],
            "days_until": l["days_until"],
            "renewal_status": l["renewal_status"],
        }
        for l in leases if l["urgency"] in ("CRITICAL", "HIGH")
    ]

    prompt = f"""Analyze this residential portfolio and generate risk alerts.

PROPERTIES:
{json.dumps(prop_summaries, indent=2)}

CRITICAL/HIGH URGENCY LEASES:
{json.dumps(urgent_leases, indent=2)}

Generate a JSON array of 5-8 risk alerts covering the most important risks and opportunities."""

    response = client.messages.create(
        model=settings.model,
        max_tokens=2000,
        system=SYSTEM_RISK_ALERTS,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    _risk_alerts_cache = json.loads(raw)
    return _risk_alerts_cache


SYSTEM_DRAFT_NOTICE = """You are a property management notice drafting assistant for an institutional PE real estate firm.
Draft formal, legally appropriate notices ready to print and send.
Use plain text only — no markdown, no bullet symbols, no asterisks.
Include specific legal citations relevant to the property's state and city."""


def stream_draft_notice(alert: dict):
    """Stream a legal notice draft based on a risk alert."""
    from data.mock_portfolio import PROPERTIES

    property_name = alert.get("property", "")
    unit = alert.get("unit")
    message = alert.get("message", "")
    action = alert.get("action", "")
    analysis = alert.get("analysis", "")
    level = alert.get("level", "")

    city = "Unknown"
    for p in PROPERTIES:
        if p["name"] == property_name:
            city = p["city"]
            break

    unit_line = f"Unit: {unit}" if unit else "Property-level notice"
    prompt = f"""Draft a formal property management notice for the following situation.

Property: {property_name} ({city})
{unit_line}
Alert Level: {level}
Issue: {message}
Required Action: {action}
Context: {analysis or "N/A"}

Write a formal notice with:
- Date: April 19, 2025
- Property address and unit (if applicable)
- Salutation: "Dear Resident" (or unit-specific if unit is provided)
- Clear statement of the issue with specific figures
- Exact action required and firm deadline
- Applicable legal citation for the jurisdiction (e.g., Texas Property Code §91.001 for Texas, NYC Admin Code for New York)
- Professional closing from "Plaza Property Management"

Plain text only. Ready to print and send."""

    with client.messages.stream(
        model=settings.model,
        max_tokens=800,
        system=SYSTEM_DRAFT_NOTICE,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {json.dumps({'chunk': text})}\n\n"
    yield "data: [DONE]\n\n"


def stream_narrative(application: dict, result: dict, property_name: str):
    """Call 2: SSE streaming narrative. Returns a generator of SSE-formatted strings."""
    prompt = _build_narrative_prompt(application, result, property_name)
    with client.messages.stream(
        model=settings.model,
        max_tokens=700,
        system=SYSTEM_NARRATIVE,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {json.dumps({'chunk': text})}\n\n"
    yield "data: [DONE]\n\n"
