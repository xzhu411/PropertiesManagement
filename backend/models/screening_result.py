from pydantic import BaseModel
from typing import Optional


class IncomeAnalysis(BaseModel):
    monthly_gross: float
    monthly_rent: float
    ratio: float
    meets_3x_standard: bool
    income_stability_score: float
    income_stability_rationale: str


class RiskFlag(BaseModel):
    category: str  # INCOME | CREDIT | RENTAL_HISTORY | EMPLOYMENT | BEHAVIORAL
    severity: str  # HIGH | MEDIUM | LOW
    flag: str
    detail: str
    mitigant: Optional[str] = None


class FHAFlag(BaseModel):
    trigger: str
    protected_class: str
    legal_citation: str
    compliant_alternative: str


class FHACompliance(BaseModel):
    is_compliant: bool
    flags: list[FHAFlag]
    overall_assessment: str


class NPVParty(BaseModel):
    vacancy_probability_pct: float
    expected_vacancy_cost: float
    eviction_probability_pct: float
    expected_eviction_cost: float
    expected_net_revenue_12mo: float


class NPVAssumptions(BaseModel):
    vacancy_cost_per_month: float
    eviction_cost_estimate: float
    discount_rate_annual_pct: float


class NPVModel(BaseModel):
    monthly_rent: float
    analysis_period_months: int
    applicant: NPVParty
    market_average: NPVParty
    delta_vs_market: float
    delta_pct: float
    npv_assumptions: NPVAssumptions


class ScreeningResult(BaseModel):
    recommendation: str  # APPROVED | CONDITIONAL | DENIED
    confidence_score: float
    income_analysis: IncomeAnalysis
    risk_flags: list[RiskFlag]
    fha_compliance: FHACompliance
    npv_model: NPVModel
    conditions: Optional[list[str]] = None
    summary_headline: str
