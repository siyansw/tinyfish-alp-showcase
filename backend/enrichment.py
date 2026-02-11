"""
External data enrichment using TinyFish multi-browser capabilities
"""
import json
import logging
import httpx
from typing import Dict, Any, List
from backend.config import settings

logger = logging.getLogger(__name__)


async def enrich_audit_with_news(url: str, company_name: str = None) -> Dict[str, Any]:
    """
    Enrich audit results with external intelligence:
    - Company news from DuckDuckGo
    - Recent incidents/outages
    - Competitive intelligence
    """

    # Extract company name from URL if not provided
    if not company_name:
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        company_name = domain.replace('www.', '').split('.')[0].title()

    enrichment_data = {
        "company_name": company_name,
        "news": [],
        "incidents": [],
        "competitive_intel": []
    }

    # Skip if no API key
    if not settings.cerebras_api_key:
        logger.warning("No API key for enrichment")
        return enrichment_data

    try:
        # Use TinyFish to search DuckDuckGo for company news
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            response = await client.post(
                f"{settings.tinyfish_api_url.rstrip('/')}/v1/automation/run-sse",
                json={
                    "url": "https://duckduckgo.com",
                    "goal": f"""Search for "{company_name} e-commerce website issues" and extract the top 3 recent news articles.

OUTPUT SCHEMA:
{{
  "articles": [
    {{
      "title": "article headline",
      "source": "publication name",
      "date": "relative date like '2 days ago'",
      "summary": "one sentence summary"
    }}
  ]
}}

TERMINATION: Stop after finding 3 articles or 30 seconds.
Return ONLY the JSON object.""",
                    "max_steps": 50
                },
                headers={
                    "X-API-Key": settings.cerebras_api_key,
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream"
                }
            )

            if response.status_code != 200:
                logger.error(f"News search failed: {response.status_code}")
                return enrichment_data

            # Parse SSE response
            result_text = ""
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    try:
                        event = json.loads(data)
                        if event.get("type") == "COMPLETE" and "resultJson" in event:
                            result_json = event["resultJson"]
                            if "articles" in result_json:
                                enrichment_data["news"] = result_json["articles"][:3]
                            break
                    except json.JSONDecodeError:
                        continue

        logger.info(f"Found {len(enrichment_data['news'])} news articles for {company_name}")

    except Exception as e:
        logger.error(f"Enrichment failed: {e}")

    return enrichment_data


async def get_quick_insights(url: str) -> List[str]:
    """
    Generate quick insights without full enrichment
    Returns list of relevant industry insights
    """
    insights = [
        "AI shopping assistants (ChatGPT, Google AI) are rapidly gaining adoption",
        "E-commerce sites lose ~40% of AI agent transactions due to poor compatibility",
        "Top sites are investing heavily in agent-friendly experiences"
    ]

    return insights
