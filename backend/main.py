from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import logging
from pathlib import Path

from backend.models import AuditRequest, AuditResponse
from backend.tinyfish_client import run_audit
from backend.enrichment import get_quick_insights

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TinyFish Agent Loss Prevention",
    description="Showcase dashboard for TinyFish's AI-powered website audits",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Mount static files
app.mount("/static", StaticFiles(directory=BASE_DIR / "frontend" / "static"), name="static")


@app.get("/")
async def read_root():
    """Serve the main dashboard page"""
    return FileResponse(BASE_DIR / "frontend" / "index.html")


@app.get("/loading")
async def read_loading():
    """Serve the loading page"""
    return FileResponse(BASE_DIR / "frontend" / "loading.html")


@app.get("/dashboard")
async def read_dashboard():
    """Serve the dashboard page"""
    return FileResponse(BASE_DIR / "frontend" / "index.html")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "tinyfish-alp-showcase"}


@app.post("/api/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest):
    """
    Trigger a new audit for the provided URL.

    This endpoint:
    1. Validates the URL
    2. Calls TinyFish API with the audit prompt
    3. Parses the response into structured data
    4. Returns the audit results

    Falls back to mock data if TinyFish API is unavailable.
    """
    try:
        logger.info(f"Starting audit for URL: {request.url}")

        # Generate unique audit ID
        audit_id = str(uuid.uuid4())

        # Run the audit using TinyFish API (with fallback to mock)
        result = await run_audit(request.url)

        logger.info(f"Audit completed for {request.url}: {result.total_issues} issues found")

        return AuditResponse(
            audit_id=audit_id,
            status="completed",
            result=result
        )

    except Exception as e:
        logger.error(f"Audit failed for {request.url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Audit failed: {str(e)}"
        )


@app.get("/api/audit/{audit_id}")
async def get_audit(audit_id: str):
    """
    Retrieve audit results by ID.

    For MVP, this is not implemented (no database).
    In production, this would query stored audit results.
    """
    raise HTTPException(
        status_code=501,
        detail="Audit history not implemented in MVP. Run a new audit instead."
    )


@app.get("/api/insights")
async def get_insights():
    """
    Get quick industry insights about AI agent adoption
    """
    insights = await get_quick_insights("")
    return {
        "insights": insights,
        "updated": "2026-02-07"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
