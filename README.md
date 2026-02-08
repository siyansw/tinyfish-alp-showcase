# TinyFish Agent Loss Prevention - Showcase Dashboard

A stunning dashboard that showcases TinyFish's unique capability to perform intelligent, reasoning-based website audits that detect issues traditional crawlers miss.

## 🎯 What This Does

**The Problem:** AI agents transacting on websites cannot work around errors like humans do. When agents encounter broken links, out-of-season promotions, or nonsensical pricing, they abandon transactions - resulting in direct revenue loss.

**The Solution:** TinyFish performs AI-powered audits that catch three types of agent-breaking issues:

1. **Technical failures**: broken links, dead CTAs, missing images, broken forms
2. **Contextual errors**: out-of-season content, pricing anomalies, contradictory descriptions
3. **Competitive gaps**: missing purchase info, unclear checkout paths, hidden pricing

**TinyFish's Differentiator:** Unlike traditional crawlers that only check HTTP codes, TinyFish uses deep AI reasoning to understand *context* - it detects seasonal content that's outdated, prices that don't make sense, and descriptions that contradict each other.

## 🚀 Features

- **Beautiful Dashboard**: Stripe-inspired design with purple/indigo color palette
- **Pre-loaded Example**: Dashboard shows sample audit data immediately (no empty state)
- **Live Audits**: Users can audit any URL (their site or competitors)
- **Visual Analytics**: Charts showing issue distribution by category and severity
- **Risk Scoring**: AI-calculated risk score (0-100) based on issue severity
- **Detailed Issue Cards**: Each issue clearly explains the agent impact
- **Clear CTAs**: Convert free users to paid customers with compelling upgrade paths

## 📁 Project Structure

```
tinyfish-alp-showcase/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic data models
│   ├── tinyfish_client.py   # TinyFish MCP integration
│   ├── prompts.py           # Audit prompt template
│   └── config.py            # Configuration settings
├── frontend/
│   ├── index.html           # Main dashboard page
│   ├── loading.html         # Loading/progress page
│   └── static/
│       ├── css/
│       │   └── styles.css   # Stripe-inspired styles
│       ├── js/
│       │   ├── api.js       # API client
│       │   ├── charts.js    # Chart.js visualizations
│       │   └── dashboard.js # Dashboard logic
│       └── data/
│           └── example_audit.json  # Pre-loaded example data
├── requirements.txt         # Python dependencies
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

## 🛠️ Tech Stack

**Backend:**
- FastAPI - Lightweight async Python API
- Pydantic - Data validation and models
- TinyFish MCP - AI-powered web analysis (via `mcp__tinybrowse__research`)

**Frontend:**
- HTML/CSS/JavaScript - No build step needed
- Chart.js - Beautiful data visualizations
- Inter font - Clean, professional typography

**Deployment:**
- Vercel - Serverless deployment with GitHub integration

## 📦 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+ (for local development server, optional)
- CEREBRAS_API_KEY (for TinyFish MCP)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tinyfish-alp-showcase
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your CEREBRAS_API_KEY
   ```

4. **Run the development server**
   ```bash
   python backend/main.py
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🚢 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TinyFish ALP showcase"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - `CEREBRAS_API_KEY`: Your Cerebras API key for TinyFish

5. Deploy!

Vercel will automatically:
- Install dependencies
- Build the project
- Deploy to production
- Provide a live URL

### Step 3: Verify Deployment

1. Visit your Vercel URL
2. You should see the dashboard with example audit data pre-loaded
3. Test the "Run Your Own Audit" feature

## 🔒 Security

**CRITICAL:** API keys are stored securely as Vercel environment variables and NEVER exposed to the frontend.

- ✅ All TinyFish API calls happen backend-only
- ✅ Frontend only receives audit results (JSON)
- ✅ Environment variables configured in Vercel dashboard
- ✅ No secrets committed to repository

## 🎨 Design Philosophy

The dashboard follows a **Stripe-inspired aesthetic**:

- Clean, minimal design with lots of whitespace
- Subtle purple/indigo gradients
- Professional Inter typography
- Muted colors with pops of accent
- Card-based layout with elevated shadows
- Smooth animations and transitions

## 🔧 API Endpoints

### `POST /api/audit`
Submit a new audit request.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "audit_id": "uuid",
  "status": "completed",
  "result": {
    "url": "https://example.com",
    "audit_date": "2026-02-07T10:30:00",
    "technical_failures": [...],
    "contextual_errors": [...],
    "competitive_gaps": [...],
    "metrics": {
      "riskScore": 73,
      "totalIssues": 12,
      "criticalCount": 3
    }
  }
}
```

### `GET /health`
Health check endpoint.

## 📊 How It Works

1. **User lands on page**: Dashboard shows pre-loaded example audit (no empty state)
2. **User enters URL**: Form at top allows auditing any website
3. **Backend calls TinyFish**: FastAPI sends audit prompt to TinyFish MCP `research` tool
4. **TinyFish analyzes**: AI agent browses URL, applies reasoning, returns structured findings
5. **Dashboard updates**: Charts, metrics, and issue cards render with new data
6. **Clear CTAs**: Users see upgrade options for full site audits

## 🎯 Conversion Strategy

**Free Tier (What We Built):**
- Single page audit
- 5-minute time limit
- All three issue categories
- Beautiful dashboard
- Shareable results

**Paid Tier (CTAs to Upgrade):**
- Full site crawl (unlimited pages)
- No time limit
- Deeper competitive analysis
- Historical tracking
- Scheduled recurring scans
- Priority support
- API access

## 🐛 Troubleshooting

### Dashboard not loading
- Check browser console for errors
- Verify `/static/data/example_audit.json` exists
- Check Chart.js CDN is accessible

### Audit API fails
- Verify `CEREBRAS_API_KEY` is set in environment variables
- Check FastAPI logs for errors
- For MVP, mock data is used by default (see `tinyfish_client.py`)

### Styling issues
- Clear browser cache
- Verify `/static/css/styles.css` is served correctly
- Check for CSS syntax errors

## 📝 TODO / Future Enhancements

- [ ] Database integration (SQLite/PostgreSQL) for audit history
- [ ] User authentication and accounts
- [ ] Full-site crawling (multi-page audits)
- [ ] Competitor comparison side-by-side
- [ ] Historical trend tracking
- [ ] Scheduled recurring scans
- [ ] Email notifications
- [ ] API access for paid customers
- [ ] Export to PDF/CSV

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

- **TinyFish**: AI-powered web agent platform
- **Chart.js**: Beautiful data visualizations
- **FastAPI**: Modern Python web framework
- **Vercel**: Serverless deployment platform

---

**Built with 🐟 by TinyFish** • Detecting issues traditional crawlers miss since 2026
