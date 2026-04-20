from pydantic import BaseModel
from typing import Optional


class TenantApplication(BaseModel):
    applicant_id: Optional[str] = None
    name: str
    monthly_gross_income: float
    income_sources: list[str]
    employment_months: int
    credit_score_range: str  # e.g. "720-760"
    rental_history_months: int
    previous_evictions: int
    late_payments_12mo: int
    references: int
    target_unit_rent: float
    property_id: str = "OAK-001"
    unit_type: str = "1BR"
    move_in_date_weeks: int = 4
    pets: bool = False
    additional_notes: Optional[str] = None
