"""
Pure Python financial model for tenant underwriting.
All probability math lives here — not inside Claude prompts.
"""

VACANCY_COST_BASE = 3_200        # 1 month lost rent + $800 turn cost (avg)
EVICTION_COST_BASE = 6_500       # legal + 2 months lost rent + turn
MARKET_VACANCY_RATE = 0.055      # 5.5% base vacancy probability
MARKET_EVICTION_RATE = 0.011     # 1.1% base eviction probability


def parse_credit_midpoint(credit_score_range: str) -> float:
    """Parse '720-760' → 740.0"""
    try:
        low, high = credit_score_range.split("-")
        return (float(low) + float(high)) / 2
    except Exception:
        return 650.0


def compute_income_ratio(gross_income: float, rent: float) -> dict:
    ratio = gross_income / rent if rent > 0 else 0.0
    return {
        "monthly_gross": gross_income,
        "monthly_rent": rent,
        "ratio": round(ratio, 2),
        "meets_3x_standard": ratio >= 3.0,
        "income_stability_score": _income_stability(ratio),
        "income_stability_rationale": _income_stability_rationale(ratio),
    }


def _income_stability(ratio: float) -> float:
    if ratio >= 4.0:
        return 0.95
    elif ratio >= 3.5:
        return 0.85
    elif ratio >= 3.0:
        return 0.72
    elif ratio >= 2.5:
        return 0.50
    else:
        return 0.25


def _income_stability_rationale(ratio: float) -> str:
    if ratio >= 4.0:
        return f"Income-to-rent ratio of {ratio:.2f}x provides strong debt service cushion well above institutional minimum."
    elif ratio >= 3.0:
        return f"Ratio of {ratio:.2f}x meets the 3.0x minimum underwriting standard with adequate margin."
    elif ratio >= 2.5:
        return f"Ratio of {ratio:.2f}x falls below the 3.0x standard; income coverage is thin relative to rent obligation."
    else:
        return f"Ratio of {ratio:.2f}x is materially below the 3.0x standard; income is insufficient relative to rent."


def compute_vacancy_probability(
    credit_score_range: str,
    employment_months: int,
    late_payments_12mo: int,
    rental_history_months: int,
) -> float:
    """
    Logistic-style model. Base rate × multiplicative risk factors.
    Returns probability 0.0–1.0.
    """
    credit_mid = parse_credit_midpoint(credit_score_range)
    base = MARKET_VACANCY_RATE

    # Credit factor: below 700 increases risk
    credit_factor = 1.0 + max(0, (700 - credit_mid) / 200) * 0.8

    # Employment factor: < 6 months is a meaningful risk
    if employment_months < 3:
        employment_factor = 1.6
    elif employment_months < 6:
        employment_factor = 1.3
    elif employment_months < 12:
        employment_factor = 1.1
    else:
        employment_factor = 1.0

    # Payment history factor
    if late_payments_12mo >= 3:
        payment_factor = 1.8
    elif late_payments_12mo == 2:
        payment_factor = 1.4
    elif late_payments_12mo == 1:
        payment_factor = 1.15
    else:
        payment_factor = 1.0

    # Rental history factor: no history = moderate risk
    if rental_history_months == 0:
        history_factor = 1.2
    elif rental_history_months < 12:
        history_factor = 1.1
    else:
        history_factor = 1.0

    prob = base * credit_factor * employment_factor * payment_factor * history_factor
    return round(min(prob, 0.80), 4)  # cap at 80%


def compute_eviction_probability(
    previous_evictions: int,
    credit_score_range: str,
    late_payments_12mo: int,
) -> float:
    credit_mid = parse_credit_midpoint(credit_score_range)
    base = MARKET_EVICTION_RATE

    if previous_evictions >= 2:
        eviction_factor = 5.0
    elif previous_evictions == 1:
        eviction_factor = 3.0
    else:
        eviction_factor = 1.0

    credit_factor = 1.0 + max(0, (650 - credit_mid) / 200) * 1.2

    if late_payments_12mo >= 4:
        payment_factor = 2.0
    elif late_payments_12mo >= 2:
        payment_factor = 1.5
    else:
        payment_factor = 1.0

    prob = base * eviction_factor * credit_factor * payment_factor
    return round(min(prob, 0.50), 4)


def compute_npv_model(application: dict) -> dict:
    rent = application["target_unit_rent"]
    vacancy_prob = compute_vacancy_probability(
        application["credit_score_range"],
        application["employment_months"],
        application["late_payments_12mo"],
        application["rental_history_months"],
    )
    eviction_prob = compute_eviction_probability(
        application["previous_evictions"],
        application["credit_score_range"],
        application["late_payments_12mo"],
    )

    vacancy_cost = rent + 800  # 1 month lost + turn
    eviction_cost = EVICTION_COST_BASE

    # Applicant 12-month expected revenue
    app_expected_vacancy_cost = vacancy_cost * vacancy_prob
    app_expected_eviction_cost = eviction_cost * eviction_prob
    app_net_revenue = rent * 12 * (1 - vacancy_prob) - app_expected_eviction_cost

    # Market average baseline
    mkt_expected_vacancy_cost = vacancy_cost * MARKET_VACANCY_RATE
    mkt_expected_eviction_cost = eviction_cost * MARKET_EVICTION_RATE
    mkt_net_revenue = rent * 12 * (1 - MARKET_VACANCY_RATE) - mkt_expected_eviction_cost

    delta = app_net_revenue - mkt_net_revenue
    delta_pct = (delta / mkt_net_revenue * 100) if mkt_net_revenue != 0 else 0

    return {
        "monthly_rent": rent,
        "analysis_period_months": 12,
        "applicant": {
            "vacancy_probability_pct": round(vacancy_prob * 100, 1),
            "expected_vacancy_cost": round(app_expected_vacancy_cost, 0),
            "eviction_probability_pct": round(eviction_prob * 100, 1),
            "expected_eviction_cost": round(app_expected_eviction_cost, 0),
            "expected_net_revenue_12mo": round(app_net_revenue, 0),
        },
        "market_average": {
            "vacancy_probability_pct": round(MARKET_VACANCY_RATE * 100, 1),
            "expected_vacancy_cost": round(mkt_expected_vacancy_cost, 0),
            "eviction_probability_pct": round(MARKET_EVICTION_RATE * 100, 1),
            "expected_eviction_cost": round(mkt_expected_eviction_cost, 0),
            "expected_net_revenue_12mo": round(mkt_net_revenue, 0),
        },
        "delta_vs_market": round(delta, 0),
        "delta_pct": round(delta_pct, 1),
        "npv_assumptions": {
            "vacancy_cost_per_month": vacancy_cost,
            "eviction_cost_estimate": eviction_cost,
            "discount_rate_annual_pct": 7.5,
        },
    }
