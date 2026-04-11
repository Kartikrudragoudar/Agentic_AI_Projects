from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    service: str


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Health check endpoint.

    Returns:
        JSON with status, version, and service name.
    """
    return HealthResponse(
        status="ok",
        version="1.0.0",
        service="Banking AI Support Agent",
    )
