from fastapi import APIRouter
from data.mock_portfolio import PROPERTIES, PORTFOLIO_SUMMARY, NOI_TREND, LEASE_EXPIRATIONS, AI_RISK_ALERTS, LEASE_EXPIRY_DISTRIBUTION

router = APIRouter()


@router.get("/portfolio/summary")
def get_portfolio_summary():
    return PORTFOLIO_SUMMARY


@router.get("/portfolio/properties")
def get_properties():
    return PROPERTIES


@router.get("/portfolio/properties/{property_id}")
def get_property(property_id: str):
    for p in PROPERTIES:
        if p["id"] == property_id:
            return p
    return {"error": "Property not found"}


@router.get("/portfolio/noi-trend")
def get_noi_trend():
    return NOI_TREND


@router.get("/portfolio/lease-expiry")
def get_lease_expiry():
    return LEASE_EXPIRATIONS


@router.get("/portfolio/lease-expiry-distribution")
def get_lease_expiry_distribution():
    return LEASE_EXPIRY_DISTRIBUTION


@router.get("/portfolio/risk-alerts")
def get_risk_alerts():
    return AI_RISK_ALERTS
