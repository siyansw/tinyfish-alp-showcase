from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any

from backend.models import AuditRequest, AuditResponse
from backend.tinyfish_client import run_audit
from backend.enrichment import get_quick_insights, enrich_audit_with_news

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory cache for background news tasks
news_tasks: Dict[str, asyncio.Task] = {}
news_results: Dict[str, Any] = {}

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
    3. Enriches with company news from DuckDuckGo
    4. Returns the audit results with enrichment data
    """
    try:
        logger.info(f"Starting audit for URL: {request.url}")

        # Generate unique audit ID
        audit_id = str(uuid.uuid4())

        # Start BOTH audit and news in parallel (TinyFish can handle parallel sessions)
        logger.info("Starting audit and news enrichment in parallel")

        # Start news task in background immediately
        async def fetch_and_cache_news():
            try:
                news_data = await enrich_audit_with_news(request.url)
                news_results[request.url] = news_data
                logger.info(f"News enrichment completed for {request.url}: {len(news_data.get('news', []))} articles")
            except Exception as e:
                logger.error(f"News enrichment failed for {request.url}: {e}")
                news_results[request.url] = {"company_name": "", "news": [], "incidents": [], "competitive_intel": [], "error": str(e)}
            finally:
                # Clean up task reference
                if request.url in news_tasks:
                    del news_tasks[request.url]

        # Create background task for news
        news_tasks[request.url] = asyncio.create_task(fetch_and_cache_news())

        # Run audit (will complete while news is still running in background)
        result = await run_audit(request.url)

        logger.info(f"Audit completed for {request.url}: {result.total_issues} issues found")

        # Return audit results immediately (news is still running in background)
        result.enrichment = None

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


@app.get("/api/news/{url:path}")
async def get_company_news(url: str):
    """
    Get company-specific news for a given URL.

    This endpoint checks if news is already being fetched in the background
    (started when audit was triggered). If so, it waits for that task.
    If not, it starts a new fetch.
    """
    try:
        logger.info(f"News request for: {url}")

        # Check if result is already cached
        if url in news_results:
            logger.info(f"Returning cached news for {url}")
            return news_results[url]

        # Check if task is currently running
        if url in news_tasks:
            logger.info(f"Waiting for in-progress news task for {url}")
            await news_tasks[url]
            return news_results.get(url, {
                "company_name": "",
                "news": [],
                "incidents": [],
                "competitive_intel": []
            })

        # No cached result and no running task - start a new fetch
        logger.info(f"Starting new news fetch for {url}")
        enrichment_data = await enrich_audit_with_news(url)
        logger.info(f"News fetch completed: {len(enrichment_data.get('news', []))} articles found")

        # Cache the result
        news_results[url] = enrichment_data
        return enrichment_data

    except Exception as e:
        logger.error(f"News fetch failed for {url}: {str(e)}")
        # Return empty data on failure, don't error out
        return {
            "company_name": "",
            "news": [],
            "incidents": [],
            "competitive_intel": [],
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
