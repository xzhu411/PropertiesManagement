from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.tenant import TenantApplication
from services import screening_engine, fha_checker, claude_service
from data.mock_applicants import APPLICANT_PRESETS
from data.mock_portfolio import PROPERTIES

router = APIRouter()


def _get_property(property_id: str) -> tuple[str, str]:
    for p in PROPERTIES:
        if p["id"] == property_id:
            return p["name"], p["city"]
    return "Unknown Property", "Unknown City"


@router.get("/applicants/presets")
def get_presets():
    return APPLICANT_PRESETS


@router.post("/screen-tenant")
def screen_tenant(application: TenantApplication):
    app_dict = application.model_dump()
    property_name, city = _get_property(application.property_id)

    # Pre-compute financial model in pure Python
    npv_pre = screening_engine.compute_npv_model(app_dict)
    fha_pre = fha_checker.check_fha_risks(app_dict, city)

    # Call Claude for structured analysis
    result = claude_service.run_structured_screening(app_dict, property_name, city, npv_pre, fha_pre)
    return result


@router.post("/screen-tenant/stream")
def screen_tenant_stream(application: TenantApplication):
    app_dict = application.model_dump()
    property_name, city = _get_property(application.property_id)

    # Compute financial model
    npv_pre = screening_engine.compute_npv_model(app_dict)
    fha_pre = fha_checker.check_fha_risks(app_dict, city)

    # Get structured result first (synchronous)
    result = claude_service.run_structured_screening(app_dict, property_name, city, npv_pre, fha_pre)

    # Stream narrative
    return StreamingResponse(
        claude_service.stream_narrative(app_dict, result, property_name),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/screen-tenant/full")
def screen_tenant_full(application: TenantApplication):
    """Returns structured result + triggers narrative stream info — used by frontend two-step flow."""
    app_dict = application.model_dump()
    property_name, city = _get_property(application.property_id)

    npv_pre = screening_engine.compute_npv_model(app_dict)
    fha_pre = fha_checker.check_fha_risks(app_dict, city)
    result = claude_service.run_structured_screening(app_dict, property_name, city, npv_pre, fha_pre)

    return {
        "structured": result,
        "property_name": property_name,
        "city": city,
    }
