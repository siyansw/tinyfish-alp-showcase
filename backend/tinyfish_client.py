import json
import logging
from datetime import datetime
from typing import Dict, Any
import httpx
from fastapi import HTTPException
from backend.models import AuditResult
from backend.prompts import AUDIT_PROMPT
from backend.config import settings

logger = logging.getLogger(__name__)


def parse_tinyfish_response(result: str, url: str) -> Dict[str, Any]:
    """
    Parse TinyFish research tool response into structured audit data.

    The TinyFish research tool returns a string that may contain JSON.
    We need to extract and parse the JSON response.
    """
    try:
        # Try to find JSON in the response
        # Look for the first { and last } to extract JSON
        start_idx = result.find('{')
        end_idx = result.rfind('}')

        if start_idx == -1 or end_idx == -1:
            logger.warning("No JSON found in TinyFish response, returning empty audit")
            return {
                "url": url,
                "audit_date": datetime.now(),
                "technical_failures": [],
                "contextual_errors": [],
                "competitive_gaps": []
            }

        json_str = result[start_idx:end_idx + 1]
        audit_data = json.loads(json_str)

        # Add URL and audit date
        audit_data["url"] = url
        audit_data["audit_date"] = datetime.now()

        return audit_data

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse TinyFish JSON response: {e}")
        # Return empty audit on parse failure
        return {
            "url": url,
            "audit_date": datetime.now(),
            "technical_failures": [],
            "contextual_errors": [],
            "competitive_gaps": []
        }
    except Exception as e:
        logger.error(f"Unexpected error parsing TinyFish response: {e}")
        return {
            "url": url,
            "audit_date": datetime.now(),
            "technical_failures": [],
            "contextual_errors": [],
            "competitive_gaps": []
        }


async def run_audit_mock(url: str) -> AuditResult:
    """
    Mock audit function for testing without TinyFish.
    Returns sample data for demonstration purposes.
    """
    audit_data = {
        "url": url,
        "audit_date": datetime.now(),
        "technical_failures": [
            {
                "error_type": "broken_link",
                "element": "Customer Support link in footer",
                "location": "Footer navigation section",
                "expected_behavior": "Should navigate to support contact page",
                "actual_behavior": "Returns 404 Not Found error",
                "transaction_impact": "Agent cannot reach support if encountering issues, leading to transaction abandonment when problems arise",
                "severity": "high"
            },
            {
                "error_type": "dead_cta",
                "element": "Add to Cart button",
                "location": "Product detail page, primary CTA below product description",
                "expected_behavior": "Should add item to shopping cart and show confirmation",
                "actual_behavior": "Button click produces no action, no error message displayed",
                "transaction_impact": "Complete transaction failure - agent cannot add items to cart, 100% abandonment rate",
                "severity": "critical"
            }
        ],
        "contextual_errors": [
            {
                "error_type": "seasonal_mismatch",
                "content": "🎄 Holiday Gift Guide - Perfect Presents for Everyone!",
                "location": "Homepage hero banner section",
                "why_wrong": "Current date is February 2026, well past holiday shopping season",
                "agent_confusion": "Agent may interpret as outdated content, skip promotional pricing, or question site maintenance",
                "severity": "medium"
            },
            {
                "error_type": "price_contradiction",
                "content": "Product listed as $49.99 in search results but $69.99 on product page",
                "location": "Search results grid vs. product detail page",
                "why_wrong": "Same product shows different prices in different contexts",
                "agent_confusion": "Agent cannot determine correct price, may abandon due to pricing uncertainty or perceived deception",
                "severity": "high"
            }
        ],
        "competitive_gaps": [
            {
                "gap_type": "missing_pricing",
                "missing_element": "Shipping costs and delivery timeframes",
                "location": "Product pages and cart view",
                "competitor_standard": "Major e-commerce sites show estimated shipping costs and delivery dates before checkout",
                "agent_impact": "Agent must proceed through entire checkout flow to discover total cost, increasing friction and abandonment",
                "severity": "high"
            },
            {
                "gap_type": "unclear_availability",
                "missing_element": "Real-time stock status",
                "location": "Product listing and detail pages",
                "competitor_standard": "Show 'In Stock', 'Low Stock', or 'Out of Stock' badges prominently",
                "agent_impact": "Agent cannot determine if product is available before adding to cart, leading to checkout failures",
                "severity": "medium"
            }
        ]
    }

    return AuditResult(**audit_data)


async def run_audit(url: str) -> AuditResult:
    """
    Use TinyFish/Mino API to audit a URL.
    Requires CEREBRAS_API_KEY environment variable (used as MINO_API_KEY).
    Raises exception if API call fails - no fallback to mock data.
    """
    # Check for API key
    if not settings.cerebras_api_key:
        raise ValueError("CEREBRAS_API_KEY not configured. Please set your Mino API key.")

    # Build the audit task - TinyFish will automatically visit the URL we pass
    # No need to repeat "Visit {url}" since the url parameter handles navigation
    audit_task = AUDIT_PROMPT

    logger.info(f"Calling TinyFish/Mino API for URL: {url}")

    async with httpx.AsyncClient(timeout=300.0, follow_redirects=True) as client:  # 5 minute timeout
        # Call TinyFish/Mino automation endpoint (SSE streaming)
        api_url = "https://mino.ai/v1/automation/run-sse"

        async with client.stream(
            "POST",
            api_url,
            json={
                "url": url,
                "goal": audit_task,
                "max_steps": 100
            },
            headers={
                "X-API-Key": settings.cerebras_api_key,
                "Content-Type": "application/json",
                "Accept": "text/event-stream"
            }
        ) as response:
            if response.status_code != 200:
                error_text = await response.aread()
                error_msg = f"TinyFish API returned status {response.status_code}: {error_text.decode()}"
                logger.error(error_msg)
                raise HTTPException(status_code=502, detail=f"TinyFish API error: {error_msg}")

            # Read SSE stream and collect final result
            result_text = ""
            raw_events = []
            async for line in response.aiter_lines():
                if line.strip():
                    raw_events.append(line)
                    logger.info(f"SSE line: {line[:300]}")  # Log first 300 chars for debugging

                if line.startswith("data: "):
                    data = line[6:]  # Remove "data: " prefix
                    if data.strip() and data != "[DONE]":
                        try:
                            event = json.loads(data)
                            logger.info(f"Parsed event type: {event.get('type')}")

                            # Handle COMPLETE event with resultJson
                            if event.get("type") == "COMPLETE":
                                if "resultJson" in event:
                                    result_json = event["resultJson"]
                                    # Check for rejection
                                    if "rejected" in result_json:
                                        logger.warning(f"Run rejected: {result_json['rejected']}")
                                    else:
                                        # The resultJson IS the audit result!
                                        # It contains technical_failures, contextual_errors, competitive_gaps
                                        result_text = json.dumps(result_json)
                                        logger.info(f"Got audit result with {len(result_text)} chars")
                            # Collect other result formats
                            elif "result" in event:
                                result_text = event["result"]
                            elif "output" in event:
                                result_text += event["output"]
                            elif "message" in event:
                                result_text += event["message"]
                        except json.JSONDecodeError:
                            # Might be plain text
                            result_text += data

            logger.info(f"Collected {len(raw_events)} SSE events, result length: {len(result_text)}")
            if result_text:
                logger.info(f"Result preview: {result_text[:500]}")

        result = {"result": result_text}

    # Parse the response
    result_text = result.get("result", "") if isinstance(result, dict) else str(result)
    audit_data = parse_tinyfish_response(result_text, url)

    logger.info(f"TinyFish audit completed for {url}")
    return AuditResult(**audit_data)
