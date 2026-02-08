// API client for TinyFish audit backend

const API_BASE_URL = window.location.origin;

/**
 * Fetch example audit data (pre-loaded sample)
 */
export async function fetchExampleAudit() {
  try {
    const response = await fetch('/static/data/example_audit.json');
    if (!response.ok) {
      throw new Error('Failed to load example audit data');
    }
    const data = await response.json();
    return processAuditData(data);
  } catch (error) {
    console.error('Error fetching example audit:', error);
    throw error;
  }
}

/**
 * Submit a new audit request
 */
export async function submitAudit(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Audit request failed');
    }

    const data = await response.json();
    return processAuditData(data.result);
  } catch (error) {
    console.error('Error submitting audit:', error);
    throw error;
  }
}

/**
 * Process audit data and compute metrics
 */
function processAuditData(data) {
  const allIssues = [
    ...(data.technical_failures || []),
    ...(data.contextual_errors || []),
    ...(data.competitive_gaps || [])
  ];

  // Count by severity
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const highCount = allIssues.filter(i => i.severity === 'high').length;
  const mediumCount = allIssues.filter(i => i.severity === 'medium').length;
  const lowCount = allIssues.filter(i => i.severity === 'low').length;

  // Calculate risk score (critical=25, high=10, medium=5, low=2)
  const riskScore = Math.min(100,
    criticalCount * 25 +
    highCount * 10 +
    mediumCount * 5 +
    lowCount * 2
  );

  return {
    ...data,
    metrics: {
      totalIssues: allIssues.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      riskScore,
      technicalCount: (data.technical_failures || []).length,
      contextualCount: (data.contextual_errors || []).length,
      competitiveCount: (data.competitive_gaps || []).length
    },
    allIssues
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
