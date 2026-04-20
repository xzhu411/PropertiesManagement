export interface UnitMix {
  type: string;
  count: number;
  sqft: number;
  market_rent: number;
}

export interface PropertyFinancials {
  gross_potential_rent_monthly: number;
  physical_occupancy_pct: number;
  economic_occupancy_pct: number;
  total_revenue_monthly: number;
  operating_expenses_monthly: number;
  noi_monthly: number;
  noi_annual: number;
  cap_rate: number;
  collection_rate_pct: number;
}

export interface PropertyDebt {
  loan_balance: number;
  interest_rate_pct: number;
  amortization_years: number;
  annual_debt_service: number;
  dscr: number;
  ltv_pct: number;
  maturity_date: string;
}

export interface Property {
  id: string;
  name: string;
  city: string;
  address: string;
  units: number;
  asset_class: string;
  vintage: number;
  acquisition_price: number;
  current_value: number;
  financials: PropertyFinancials;
  debt: PropertyDebt;
  unit_mix: UnitMix[];
  lease_expirations_90d: number;
  ai_risk_score: number;
  rent_vs_market_pct: number;
}

export interface PortfolioSummary {
  total_properties: number;
  total_units: number;
  blended_occupancy_pct: number;
  total_noi_annual: number;
  blended_cap_rate: number;
  total_aum: number;
  blended_collection_rate: number;
  leases_expiring_90d: number;
  cre_multifamily_benchmark_cap_rate: number;
  total_units_at_risk: number;
  blended_dscr: number;
  total_loan_balance: number;
  dscr_watch_properties: string[];
}

export interface NOIPoint {
  month: string;
  noi: number;
  budget: number;
}

export interface LeaseExpiry {
  unit: string;
  property: string;
  tenant: string;
  rent: number;
  expires: string;
  days_until: number;
  renewal_status: string;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface LeaseExpiryBucket {
  label: string;
  total: number;
  peak: boolean;
  by_property: Record<string, number>;
}

export interface LeaseExpiryDistributionData {
  "30": LeaseExpiryBucket[];
  "60": LeaseExpiryBucket[];
  "90": LeaseExpiryBucket[];
}

export interface RiskActionLink {
  label: string;
  href: string;
}

export interface RiskAlert {
  level: "URGENT" | "WATCH" | "INFO";
  property: string;
  unit: string | null;
  message: string;
  action: string;
  analysis?: string;
  action_links?: RiskActionLink[];
}

export interface TenantApplication {
  name: string;
  monthly_gross_income: number;
  income_sources: string[];
  employment_months: number;
  credit_score_range: string;
  rental_history_months: number;
  previous_evictions: number;
  late_payments_12mo: number;
  references: number;
  target_unit_rent: number;
  property_id: string;
  unit_type: string;
  move_in_date_weeks: number;
  pets: boolean;
  additional_notes?: string;
}

export interface IncomeAnalysis {
  monthly_gross: number;
  monthly_rent: number;
  ratio: number;
  meets_3x_standard: boolean;
  income_stability_score: number;
  income_stability_rationale: string;
}

export interface RiskFlag {
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  flag: string;
  detail: string;
  mitigant: string | null;
}

export interface FHAFlag {
  trigger: string;
  protected_class: string;
  legal_citation: string;
  compliant_alternative: string;
}

export interface FHACompliance {
  is_compliant: boolean;
  flags: FHAFlag[];
  overall_assessment: string;
}

export interface NPVParty {
  vacancy_probability_pct: number;
  expected_vacancy_cost: number;
  eviction_probability_pct: number;
  expected_eviction_cost: number;
  expected_net_revenue_12mo: number;
}

export interface NPVModel {
  monthly_rent: number;
  analysis_period_months: number;
  applicant: NPVParty;
  market_average: NPVParty;
  delta_vs_market: number;
  delta_pct: number;
  npv_assumptions: {
    vacancy_cost_per_month: number;
    eviction_cost_estimate: number;
    discount_rate_annual_pct: number;
  };
}

export interface ScreeningResult {
  recommendation: "APPROVED" | "CONDITIONAL" | "DENIED";
  confidence_score: number;
  income_analysis: IncomeAnalysis;
  risk_flags: RiskFlag[];
  fha_compliance: FHACompliance;
  npv_model: NPVModel;
  conditions: string[] | null;
  summary_headline: string;
}

export interface ApplicantPreset {
  id: string;
  label: string;
  badge_color: string;
  name: string;
  monthly_gross_income: number;
  income_sources: string[];
  employment_months: number;
  credit_score_range: string;
  rental_history_months: number;
  previous_evictions: number;
  late_payments_12mo: number;
  references: number;
  target_unit_rent: number;
  property_id: string;
  unit_type: string;
  move_in_date_weeks: number;
  pets: boolean;
  additional_notes?: string;
  expected_outcome: string;
}

export interface RentOptimization {
  property_id: string;
  property_name: string;
  cap_rate: number;
  cre_benchmark_cap_rate: number;
  cap_rate_vs_benchmark_bps: number;
  optimizations: UnitOptimization[];
  total_annual_uplift_potential: number;
}

export interface UnitOptimization {
  unit_type: string;
  count: number;
  current_rent: number;
  market_rent: number;
  suggested_rent: number;
  rent_increase: number;
  rent_increase_pct: number;
  retention_probability_pct: number;
  churn_probability_pct: number;
  expected_value_12mo: number;
  vacancy_cost_if_churned: number;
  annual_uplift_if_all_units: number;
}
