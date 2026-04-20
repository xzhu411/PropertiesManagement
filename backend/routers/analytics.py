from fastapi import APIRouter
from data.mock_portfolio import PROPERTIES

router = APIRouter()

CRE_BENCHMARK_CAP_RATE = 5.20  # CBRE Q4 2024 multifamily


def _compute_rent_optimization(prop: dict) -> dict:
    optimizations = []
    for unit in prop["unit_mix"]:
        # Assume current avg rent is slightly below market for flagged properties
        market_rent = unit["market_rent"]
        current_rent = round(market_rent * (1 + prop["rent_vs_market_pct"] / 100))
        gap = market_rent - current_rent

        if gap <= 0:
            continue

        # Expected value: rent increase × retention probability vs churn cost
        rent_increase = gap
        churn_probability = 0.12 + (rent_increase / market_rent) * 0.3
        churn_probability = min(churn_probability, 0.45)
        vacancy_cost = market_rent + 800
        ev_increase = rent_increase * 12 * (1 - churn_probability)
        ev_churn_cost = vacancy_cost * churn_probability
        net_ev = ev_increase - ev_churn_cost

        optimizations.append({
            "unit_type": unit["type"],
            "count": unit["count"],
            "current_rent": current_rent,
            "market_rent": market_rent,
            "suggested_rent": market_rent,
            "rent_increase": rent_increase,
            "rent_increase_pct": round(rent_increase / current_rent * 100, 1),
            "retention_probability_pct": round((1 - churn_probability) * 100, 1),
            "churn_probability_pct": round(churn_probability * 100, 1),
            "expected_value_12mo": round(net_ev, 0),
            "vacancy_cost_if_churned": vacancy_cost,
            "annual_uplift_if_all_units": round(net_ev * unit["count"], 0),
        })

    return {
        "property_id": prop["id"],
        "property_name": prop["name"],
        "cap_rate": prop["financials"]["cap_rate"],
        "cre_benchmark_cap_rate": CRE_BENCHMARK_CAP_RATE,
        "cap_rate_vs_benchmark_bps": round((prop["financials"]["cap_rate"] - CRE_BENCHMARK_CAP_RATE) * 100, 0),
        "optimizations": optimizations,
        "total_annual_uplift_potential": round(sum(o["annual_uplift_if_all_units"] for o in optimizations), 0),
    }


@router.get("/analytics/rent-optimization")
def get_rent_optimization(property_id: str = "all"):
    if property_id == "all":
        return [_compute_rent_optimization(p) for p in PROPERTIES if p["rent_vs_market_pct"] < 0]
    for p in PROPERTIES:
        if p["id"] == property_id:
            return _compute_rent_optimization(p)
    return {"error": "Property not found"}
