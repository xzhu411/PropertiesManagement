from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from data.mock_portfolio import PROPERTIES, PORTFOLIO_SUMMARY, NOI_TREND, LEASE_EXPIRATIONS, LEASE_EXPIRY_DISTRIBUTION
from services import claude_service


class DraftNoticeRequest(BaseModel):
    level: str
    property: str
    unit: str | None = None
    message: str
    action: str
    analysis: str | None = None

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
    return claude_service.generate_risk_alerts(PROPERTIES, LEASE_EXPIRATIONS)


@router.post("/portfolio/draft-notice")
def draft_notice(request: DraftNoticeRequest):
    return StreamingResponse(
        claude_service.stream_draft_notice(request.model_dump()),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
