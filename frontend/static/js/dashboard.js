// Main dashboard logic

import { fetchExampleAudit, submitAudit, formatDate } from './api.js';
import { createCategoryChart, createSeverityChart } from './charts.js';

let currentAuditData = null;
let categoryChart = null;
let severityChart = null;

/**
 * Initialize the dashboard
 */
export async function initDashboard() {
  try {
    // Load example audit data by default
    currentAuditData = await fetchExampleAudit();
    renderDashboard(currentAuditData, true);

    // Load industry insights
    loadIndustryInsights();

    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
    showError('Failed to load dashboard. Please refresh the page.');
  }
}

/**
 * Load and display industry insights or company news
 */
async function loadIndustryInsights(enrichmentData = null) {
  const insightsEl = document.getElementById('industry-insights');
  if (!insightsEl) return;

  // If we have enrichment data with news, show company-specific news
  if (enrichmentData && enrichmentData.news && enrichmentData.news.length > 0) {
    const companyName = enrichmentData.company_name || 'Company';
    insightsEl.innerHTML = `
      <h4 style="font-size: 0.813rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--purple-700);">
        Recent News: ${escapeHtml(companyName)}
      </h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${enrichmentData.news.map(article => `
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">
            <div style="font-weight: 500; color: var(--purple-900); margin-bottom: 0.25rem;">
              ${escapeHtml(article.title)}
            </div>
            <div style="font-size: 0.75rem; color: var(--purple-700); opacity: 0.8;">
              ${escapeHtml(article.source)} • ${escapeHtml(article.date || 'Recent')}
            </div>
            ${article.summary ? `
              <div style="font-size: 0.75rem; color: var(--purple-900); opacity: 0.8; margin-top: 0.25rem;">
                ${escapeHtml(article.summary)}
              </div>
            ` : ''}
          </li>
        `).join('')}
      </ul>
      <p style="font-size: 0.688rem; margin-top: 0.75rem; opacity: 0.7;">Powered by TinyFish + DuckDuckGo</p>
    `;
    return;
  }

  // Fallback to generic industry insights
  try {
    const response = await fetch('/api/insights');
    const data = await response.json();

    if (data.insights) {
      insightsEl.innerHTML = `
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.insights.map(insight => `
            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(124, 58, 237, 0.1); line-height: 1.4;">
              <span style="color: var(--purple-600); margin-right: 0.5rem;">▸</span>
              ${insight}
            </li>
          `).join('')}
        </ul>
        <p style="font-size: 0.75rem; margin-top: 0.75rem; opacity: 0.7;">Updated: ${data.updated}</p>
      `;
    }
  } catch (error) {
    console.error('Failed to load insights:', error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  const auditForm = document.getElementById('audit-form');
  if (auditForm) {
    auditForm.addEventListener('submit', handleAuditSubmit);
  }
}

/**
 * Handle audit form submission
 */
async function handleAuditSubmit(e) {
  e.preventDefault();

  const urlInput = document.getElementById('audit-url');
  let url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a valid URL');
    return;
  }

  // Auto-add https:// if no protocol specified
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  try {
    // Show loading state
    showLoading();

    // Submit audit
    const auditData = await submitAudit(url);

    // Hide loading state
    hideLoading();

    // Render new results
    currentAuditData = auditData;
    renderDashboard(auditData, false);

    // Clear input
    urlInput.value = '';

    // Scroll to results
    document.getElementById('dashboard-content').scrollIntoView({
      behavior: 'smooth'
    });
  } catch (error) {
    hideLoading();
    showError(`Audit failed: ${error.message}`);
  }
}

/**
 * Render the complete dashboard
 */
function renderDashboard(data, isExample) {
  // Update header
  renderHeader(data, isExample);

  // Render hero metrics
  renderMetrics(data);

  // Render executive summary
  renderExecutiveSummary(data);

  // Load industry insights or company news
  loadIndustryInsights(data.enrichment);

  // Render charts
  renderCharts(data);

  // Render prognostication widgets
  renderRevenueImpact(data);
  renderFixTimeline(data);

  // Render issue cards
  renderIssues(data);

  // Show dashboard content
  const dashboardContent = document.getElementById('dashboard-content');
  if (dashboardContent) {
    dashboardContent.style.display = 'block';
  }
}

/**
 * Render dashboard header
 */
function renderHeader(data, isExample) {
  const headerEl = document.getElementById('audit-header');
  if (!headerEl) return;

  const timeAgo = formatDate(data.audit_date);
  const bannerHtml = isExample
    ? `<div class="banner">
         <p class="banner-info">
           📊 This is an example audit. Enter your URL below to run a live audit.
         </p>
       </div>`
    : '';

  headerEl.innerHTML = `
    ${bannerHtml}
    <div class="text-center mb-2">
      <h1 style="font-size: 1.25rem; margin-bottom: 0.25rem;">Agent Loss Prevention Report</h1>
      <p class="text-secondary" style="font-size: 0.813rem;">
        <span class="mono">${escapeHtml(data.url)}</span> • Audited ${timeAgo}
      </p>
    </div>
  `;
}

/**
 * Render hero metrics
 */
function renderMetrics(data) {
  const metricsEl = document.getElementById('metrics-container');
  if (!metricsEl) return;

  const { riskScore, totalIssues, criticalCount } = data.metrics;

  // Determine risk level
  let riskLevel, riskColor;
  if (riskScore >= 75) {
    riskLevel = 'Critical Risk';
    riskColor = 'var(--color-critical)';
  } else if (riskScore >= 50) {
    riskLevel = 'High Risk';
    riskColor = 'var(--color-high)';
  } else if (riskScore >= 25) {
    riskLevel = 'Medium Risk';
    riskColor = 'var(--color-medium)';
  } else {
    riskLevel = 'Low Risk';
    riskColor = '#10B981';
  }

  metricsEl.innerHTML = `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value" style="color: ${riskColor};">${riskScore}</div>
        <div class="metric-label">Risk Score / 100</div>
        <p class="text-secondary mt-1" style="font-size: 0.688rem;">${riskLevel}</p>
      </div>
      <div class="metric-card">
        <div class="metric-value">${totalIssues}</div>
        <div class="metric-label">Total Issues</div>
        <p class="text-secondary mt-1" style="font-size: 0.688rem;">Across all categories</p>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: var(--color-critical);">${criticalCount}</div>
        <div class="metric-label">Critical Issues</div>
        <p class="text-secondary mt-1" style="font-size: 0.688rem;">Immediate attention</p>
      </div>
    </div>
  `;
}

/**
 * Render executive summary with AI insights
 */
function renderExecutiveSummary(data) {
  const { riskScore, totalIssues, criticalCount, highCount } = data.metrics;

  // Generate smart insights
  const insights = [];

  // Business impact insight
  const estimatedLoss = criticalCount * 50000 + highCount * 15000;
  if (estimatedLoss > 0) {
    insights.push(`Estimated monthly revenue at risk: <strong>$${(estimatedLoss / 1000).toFixed(0)}K</strong> from AI agent transaction failures`);
  }

  // Critical action insight
  if (criticalCount > 0) {
    insights.push(`<strong>${criticalCount} critical issue${criticalCount > 1 ? 's' : ''}</strong> blocking 100% of AI agent purchases - immediate action required`);
  }

  // Risk level insight
  if (riskScore >= 75) {
    insights.push(`Your site scores in the <strong>bottom 25%</strong> for AI agent compatibility - expect significant conversion loss`);
  } else if (riskScore >= 50) {
    insights.push(`Your site has <strong>above-average risk</strong> of AI agent failures - prioritize fixes to stay competitive`);
  }

  // Technical vs contextual insight
  const techCount = data.technical_failures?.length || 0;
  const contextCount = data.contextual_errors?.length || 0;
  if (techCount > contextCount) {
    insights.push(`Primary issues are <strong>technical failures</strong> - likely easy fixes with high ROI`);
  } else if (contextCount > 0) {
    insights.push(`<strong>Contextual errors detected</strong> - outdated content confusing AI shoppers`);
  }

  // Competitive gap insight
  const compCount = data.competitive_gaps?.length || 0;
  if (compCount > 0) {
    insights.push(`Missing ${compCount} standard e-commerce element${compCount > 1 ? 's' : ''} that competitors provide - <strong>agents will prefer competitors</strong>`);
  }

  // Create summary HTML
  const summaryHtml = `
    <div class="executive-summary fade-in">
      <h3>💡 Executive Summary</h3>
      <ul>
        ${insights.map(insight => `<li>${insight}</li>`).join('')}
        ${totalIssues === 0 ? '<li>No critical issues detected - your site is well-optimized for AI agents</li>' : ''}
      </ul>
    </div>
  `;

  // Insert after metrics
  const metricsEl = document.getElementById('metrics-container');
  if (metricsEl && metricsEl.nextElementSibling) {
    metricsEl.insertAdjacentHTML('afterend', summaryHtml);
  }
}

/**
 * Render charts
 */
function renderCharts(data) {
  // Destroy existing charts
  if (categoryChart) categoryChart.destroy();
  if (severityChart) severityChart.destroy();

  // Category chart
  const categoryCtx = document.getElementById('category-chart');
  if (categoryCtx) {
    categoryChart = createCategoryChart(categoryCtx, data);
  }

  // Severity chart
  const severityCtx = document.getElementById('severity-chart');
  if (severityCtx) {
    severityChart = createSeverityChart(severityCtx, data);
  }
}

/**
 * Render revenue impact calculator with scientific methodology
 */
function renderRevenueImpact(data) {
  const { criticalCount, highCount, mediumCount, riskScore } = data.metrics;

  const impactEl = document.getElementById('revenue-impact');
  if (!impactEl) return;

  // Default assumptions (industry averages - user can edit)
  const defaults = {
    monthlyVisitors: 100000,      // Monthly site visitors
    aiAgentPercent: 2,            // % of traffic from AI agents (2023: ~2%, growing to 15% by 2025)
    conversionRate: 3,            // Baseline conversion rate %
    avgOrderValue: 75             // Average order value in $
  };

  impactEl.innerHTML = `
    <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
      <strong>Revenue Impact Calculator</strong><br>
      Based on industry data. Enter your metrics:
    </div>

    <div style="background: var(--color-bg); padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.75rem;">
      <div style="margin-bottom: 0.5rem;">
        <label style="display: block; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Monthly Visitors</label>
        <input type="number" id="monthly-visitors" value="${defaults.monthlyVisitors}"
               style="width: 100%; padding: 0.375rem; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem;"
               onchange="recalculateRevenue()">
      </div>
      <div style="margin-bottom: 0.5rem;">
        <label style="display: block; color: var(--color-text-secondary); margin-bottom: 0.25rem;">AI Agent Traffic % <span style="opacity: 0.7">(est. 2-5%)</span></label>
        <input type="number" id="ai-percent" value="${defaults.aiAgentPercent}" step="0.1"
               style="width: 100%; padding: 0.375rem; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem;"
               onchange="recalculateRevenue()">
      </div>
      <div style="margin-bottom: 0.5rem;">
        <label style="display: block; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Conversion Rate %</label>
        <input type="number" id="conversion-rate" value="${defaults.conversionRate}" step="0.1"
               style="width: 100%; padding: 0.375rem; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem;"
               onchange="recalculateRevenue()">
      </div>
      <div style="margin-bottom: 0.5rem;">
        <label style="display: block; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Avg Order Value ($)</label>
        <input type="number" id="avg-order-value" value="${defaults.avgOrderValue}"
               style="width: 100%; padding: 0.375rem; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem;"
               onchange="recalculateRevenue()">
      </div>
    </div>

    <div id="calculated-impact" style="text-align: center;"></div>

    <div style="margin-top: 1rem; padding: 0.75rem; background: var(--purple-50); border-radius: 6px; font-size: 0.688rem; color: var(--purple-900); line-height: 1.4;">
      <strong>Methodology:</strong><br>
      • Critical issues: 100% failure rate<br>
      • High issues: ~${highCount > 0 ? '40' : '0'}% abandonment<br>
      • Risk score: ${riskScore}/100<br>
      • Loss = AI Traffic × Failure Rate × Conv Rate × AOV
    </div>
  `;

  // Store defaults globally and calculate
  window.revenueDefaults = defaults;
  window.issueMetrics = { criticalCount, highCount, mediumCount, riskScore };
  recalculateRevenue();
}

/**
 * Recalculate revenue impact based on user inputs
 */
function recalculateRevenue() {
  // Get user inputs
  const monthlyVisitors = parseFloat(document.getElementById('monthly-visitors')?.value || 100000);
  const aiPercent = parseFloat(document.getElementById('ai-percent')?.value || 2);
  const conversionRate = parseFloat(document.getElementById('conversion-rate')?.value || 3);
  const avgOrderValue = parseFloat(document.getElementById('avg-order-value')?.value || 75);

  const { criticalCount, highCount, mediumCount, riskScore } = window.issueMetrics || {};

  // Calculate AI agent traffic
  const aiAgentVisits = monthlyVisitors * (aiPercent / 100);

  // Calculate failure rates based on severity
  // Critical: blocks transaction completely = 100% failure
  // High: significant friction = 40% abandonment
  // Medium: minor issues = 10% abandonment
  let failureRate = 0;
  if (criticalCount > 0) {
    failureRate = 1.0; // 100% if any critical issues
  } else if (highCount > 0) {
    failureRate = 0.4 * (highCount / (highCount + mediumCount + 1)); // Scaled by proportion
  } else {
    failureRate = 0.1 * (mediumCount / (mediumCount + 1)); // Scaled by proportion
  }

  // Adjust by overall risk score
  const riskMultiplier = (riskScore || 50) / 100;
  failureRate = Math.min(failureRate * riskMultiplier, 1.0);

  // Calculate lost revenue
  const failedTransactions = aiAgentVisits * failureRate;
  const potentialRevenue = aiAgentVisits * (conversionRate / 100) * avgOrderValue;
  const lostRevenue = failedTransactions * (conversionRate / 100) * avgOrderValue;

  // Display results
  const resultEl = document.getElementById('calculated-impact');
  if (resultEl) {
    resultEl.innerHTML = `
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--color-critical); margin-bottom: 0.5rem;">
        $${lostRevenue.toLocaleString('en-US', {maximumFractionDigits: 0})}
      </div>
      <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
        Estimated Monthly Loss from AI Agents
      </div>
      <div style="background: var(--color-bg); padding: 0.75rem; border-radius: 6px; font-size: 0.75rem; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span>AI Agent Visits/Month:</span>
          <strong>${aiAgentVisits.toLocaleString('en-US', {maximumFractionDigits: 0})}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span>Estimated Failure Rate:</span>
          <strong>${(failureRate * 100).toFixed(1)}%</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span>Lost Transactions:</span>
          <strong>${failedTransactions.toFixed(0)}/mo</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--color-border);">
          <span>Potential Revenue:</span>
          <strong style="color: var(--color-critical);">$${lostRevenue.toLocaleString('en-US', {maximumFractionDigits: 0})}/mo</strong>
        </div>
      </div>
    `;
  }
}

// Make function global so it can be called from HTML
window.recalculateRevenue = recalculateRevenue;

/**
 * Render fix timeline projections
 */
function renderFixTimeline(data) {
  const { criticalCount, highCount, mediumCount, lowCount } = data.metrics;

  // Estimate fix times (in hours)
  const criticalTime = criticalCount * 2;  // 2 hours per critical
  const highTime = highCount * 1;          // 1 hour per high
  const mediumTime = mediumCount * 0.5;    // 30 min per medium
  const lowTime = lowCount * 0.25;         // 15 min per low

  const totalHours = criticalTime + highTime + mediumTime + lowTime;
  const workDays = Math.ceil(totalHours / 6); // 6 productive hours per day

  const timelineEl = document.getElementById('fix-timeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 2rem; font-weight: 700; color: var(--purple-600); margin-bottom: 0.5rem;">
        ${workDays}
      </div>
      <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
        Days to Fix All Issues
      </div>

      <div style="background: var(--color-bg); padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; text-align: left;">
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
            <span>Critical</span>
            <span style="font-weight: 600;">${criticalTime}h</span>
          </div>
          <div style="height: 6px; background: #FEE2E2; border-radius: 3px; overflow: hidden;">
            <div style="width: ${(criticalTime / totalHours * 100).toFixed(0)}%; height: 100%; background: var(--color-critical);"></div>
          </div>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
            <span>High Priority</span>
            <span style="font-weight: 600;">${highTime}h</span>
          </div>
          <div style="height: 6px; background: #FFEDD5; border-radius: 3px; overflow: hidden;">
            <div style="width: ${(highTime / totalHours * 100).toFixed(0)}%; height: 100%; background: var(--color-high);"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
            <span>Others</span>
            <span style="font-weight: 600;">${(mediumTime + lowTime).toFixed(1)}h</span>
          </div>
          <div style="height: 6px; background: #FEF3C7; border-radius: 3px; overflow: hidden;">
            <div style="width: ${((mediumTime + lowTime) / totalHours * 100).toFixed(0)}%; height: 100%; background: var(--color-medium);"></div>
          </div>
        </div>
      </div>

      <div style="padding: 0.75rem; background: var(--purple-50); border-radius: 6px; border: 1px solid var(--purple-200);">
        <div style="font-size: 0.75rem; color: var(--purple-700);">
          <strong>ROI:</strong> Fix in ${workDays} days, recover $${((criticalCount * 50 + highCount * 15) * 0.85).toFixed(0)}K/mo
        </div>
      </div>
    </div>
  `;
}

/**
 * Render issue cards
 */
function renderIssues(data) {
  const issuesEl = document.getElementById('issues-container');
  if (!issuesEl) return;

  // Sort all issues by severity (critical first)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedIssues = [...data.allIssues].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  if (sortedIssues.length === 0) {
    issuesEl.innerHTML = `
      <div class="card text-center">
        <h3 style="font-size: 1rem;">✅ No Issues Found</h3>
        <p class="text-secondary" style="font-size: 0.813rem;">This page passed the Agent Loss Prevention audit!</p>
      </div>
    `;
    return;
  }

  // Wrap issue cards in grid layout for side-by-side display
  issuesEl.innerHTML = `
    <div class="issues-grid">
      ${sortedIssues.map(issue => renderIssueCard(issue)).join('')}
    </div>
  `;
}

/**
 * Render a single issue card
 */
function renderIssueCard(issue) {
  const severityIcon = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵'
  }[issue.severity];

  // Determine category and labels
  let categoryLabel, impactLabel, impactText;

  if (issue.error_type) {
    // Technical failure
    categoryLabel = 'Technical Failure';
    impactLabel = 'Transaction Impact';
    impactText = issue.transaction_impact;
  } else if (issue.content) {
    // Contextual error
    categoryLabel = 'Contextual Error';
    impactLabel = 'Agent Confusion';
    impactText = issue.agent_confusion;
  } else {
    // Competitive gap
    categoryLabel = 'Competitive Gap';
    impactLabel = 'Agent Impact';
    impactText = issue.agent_impact;
  }

  const title = issue.element || issue.content || issue.missing_element || 'Issue';
  const location = issue.location || 'Unknown location';
  const auditUrl = currentAuditData?.url || '';

  return `
    <div class="issue-card ${issue.severity} fade-in" style="cursor: pointer;" onclick="openAuditUrl(event)">
      <div class="issue-header">
        <span class="badge badge-${issue.severity}">
          ${severityIcon} ${issue.severity.toUpperCase()}
        </span>
        <span class="badge" style="background: #F3F4F6; color: #6B7280;">
          ${categoryLabel}
        </span>
        <button class="btn-icon" onclick="event.stopPropagation(); copyToClipboard(\`${location.replace(/`/g, '\\`')}\`, event)" title="Copy location">
          📋
        </button>
      </div>
      <h3 class="issue-title">${escapeHtml(title)}</h3>
      <p class="issue-meta">📍 ${escapeHtml(location)}</p>
      <p class="issue-impact">
        <strong>${impactLabel}:</strong> ${escapeHtml(impactText)}
      </p>
      <div class="issue-actions" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #F3F4F6;">
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.375rem 0.75rem;" onclick="event.stopPropagation(); openAuditUrl(event)">
          🔗 View on Page
        </button>
      </div>
    </div>
  `;
}

/**
 * Open the audited URL in a new tab
 */
function openAuditUrl(event) {
  if (currentAuditData && currentAuditData.url) {
    window.open(currentAuditData.url, '_blank');
  } else {
    console.error('No audit URL available');
  }
}

// Make function global so it can be called from HTML
window.openAuditUrl = openAuditUrl;

/**
 * Copy text to clipboard
 */
function copyToClipboard(text, event) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = originalText, 2000);
  });
}

/**
 * Show loading state
 */
function showLoading() {
  const dashboardContent = document.getElementById('dashboard-content');
  if (dashboardContent) {
    dashboardContent.style.opacity = '0.5';
    dashboardContent.style.pointerEvents = 'none';
  }

  // Show loading spinner
  const loadingEl = document.createElement('div');
  loadingEl.id = 'loading-overlay';
  loadingEl.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; color: var(--color-text-secondary);">
        Running audit... This may take up to 5 minutes.
      </p>
    </div>
  `;
  document.getElementById('audit-form').after(loadingEl);
}

/**
 * Hide loading state
 */
function hideLoading() {
  const dashboardContent = document.getElementById('dashboard-content');
  if (dashboardContent) {
    dashboardContent.style.opacity = '1';
    dashboardContent.style.pointerEvents = 'auto';
  }

  const loadingEl = document.getElementById('loading-overlay');
  if (loadingEl) {
    loadingEl.remove();
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.createElement('div');
  errorEl.className = 'banner';
  errorEl.style.background = '#FEE2E2';
  errorEl.style.borderColor = '#EF4444';
  errorEl.innerHTML = `
    <p style="color: #EF4444; font-weight: 500;">
      ⚠️ ${escapeHtml(message)}
    </p>
  `;

  const form = document.getElementById('audit-form');
  form.parentNode.insertBefore(errorEl, form.nextSibling);

  // Remove after 5 seconds
  setTimeout(() => errorEl.remove(), 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
