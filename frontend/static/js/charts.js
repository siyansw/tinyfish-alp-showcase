// Chart.js configuration and rendering

/**
 * Create a doughnut chart for issue distribution by category
 */
export function createCategoryChart(ctx, data) {
  const { technicalCount, contextualCount, competitiveCount } = data.metrics;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Technical Failures', 'Contextual Errors', 'Competitive Gaps'],
      datasets: [{
        data: [technicalCount, contextualCount, competitiveCount],
        backgroundColor: [
          '#EF4444', // Red for technical
          '#F59E0B', // Orange for contextual
          '#3B82F6'  // Blue for competitive
        ],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              family: 'Inter',
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: '#1A1A1A',
          padding: 12,
          titleFont: {
            size: 14,
            family: 'Inter'
          },
          bodyFont: {
            size: 13,
            family: 'Inter'
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Create a bar chart for issue distribution by severity
 */
export function createSeverityChart(ctx, data) {
  const { criticalCount, highCount, mediumCount, lowCount } = data.metrics;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        label: 'Issues by Severity',
        data: [criticalCount, highCount, mediumCount, lowCount],
        backgroundColor: [
          '#EF4444', // Critical - Red
          '#F59E0B', // High - Orange
          '#EAB308', // Medium - Yellow
          '#3B82F6'  // Low - Blue
        ],
        borderRadius: 8,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1A1A1A',
          padding: 12,
          titleFont: {
            size: 14,
            family: 'Inter'
          },
          bodyFont: {
            size: 13,
            family: 'Inter'
          },
          callbacks: {
            label: function(context) {
              return `Issues: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              family: 'Inter'
            }
          },
          grid: {
            color: '#F3F4F6'
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Create a risk score gauge (circular progress)
 */
export function createRiskGauge(ctx, riskScore) {
  const percentage = riskScore;

  // Determine color based on risk level
  let color;
  if (riskScore >= 75) color = '#EF4444'; // Critical - Red
  else if (riskScore >= 50) color = '#F59E0B'; // High - Orange
  else if (riskScore >= 25) color = '#EAB308'; // Medium - Yellow
  else color = '#10B981'; // Low - Green

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [percentage, 100 - percentage],
        backgroundColor: [color, '#F3F4F6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '75%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });
}
