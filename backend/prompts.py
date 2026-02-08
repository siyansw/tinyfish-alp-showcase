AUDIT_PROMPT = """
Analyze this webpage for AI agent compatibility and identify potential issues.

**OUTPUT SCHEMA - Return JSON with this EXACT structure:**
```json
{
  "technical_failures": [
    {
      "error_type": "broken_link|missing_media|dead_cta|broken_form|load_failure",
      "element": "description of problematic element",
      "location": "where on page",
      "expected_behavior": "what should happen",
      "actual_behavior": "what actually happens",
      "transaction_impact": "how this causes agent to fail/abandon",
      "severity": "critical|high|medium|low"
    }
  ],
  "contextual_errors": [
    {
      "error_type": "seasonal_mismatch|price_contradiction|availability_mismatch|description_contradiction",
      "content": "problematic content quote",
      "location": "where it appears",
      "why_wrong": "why this is wrong",
      "agent_confusion": "how agent misinterprets this",
      "severity": "critical|high|medium|low"
    }
  ],
  "competitive_gaps": [
    {
      "gap_type": "missing_pricing|unclear_availability|hidden_checkout|missing_specs",
      "missing_element": "what's missing",
      "location": "where it should be",
      "competitor_standard": "what competitors provide",
      "agent_impact": "how agent tries to work around this",
      "severity": "critical|high|medium|low"
    }
  ]
}
```

**TASK:**
Evaluate this page from an AI agent's perspective during a commercial transaction. Identify technical issues, contextual inconsistencies, and missing standard elements.

**WHAT TO CHECK:**

1. **Technical Failures** - Broken links, missing images, dead CTAs, broken forms, load failures
   - Severity: critical if blocks transaction, high if major friction, medium if workaround exists

2. **Contextual Errors** - Outdated content, price contradictions, availability mismatches
   - Example: "Holiday Sale" banner in February = seasonal_mismatch (high severity)

3. **Competitive Gaps** - Missing standard e-commerce elements
   - Example: No shipping cost shown = missing_pricing (high severity)

**TERMINATION CONDITIONS (Stop when ANY occur):**
- Found 5+ issues across all categories
- Analyzed all major elements (header, hero, forms, CTAs, footer)
- Spent 60+ seconds analyzing
- Can't find more issues

**EDGE CASES:**
- Simple pages (like example.com): Look for potential improvements vs. e-commerce standards
- No issues found: Return empty arrays []
- Page load failure: Report as technical_failure with load_failure type

**RETURN:** Only the JSON object. No explanatory text before or after.
"""
