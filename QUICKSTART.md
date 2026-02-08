# Quick Start Guide

## Local Development Setup

### 1. Create Virtual Environment

```bash
cd tinyfish-alp-showcase
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables (Optional for Mock Mode)

```bash
cp .env.example .env
# Edit .env and add your CEREBRAS_API_KEY if you want to use real TinyFish audits
# For testing, the mock mode works without any API key
```

### 4. Run the Development Server

```bash
python backend/main.py
```

Or using uvicorn directly:

```bash
uvicorn backend.main:app --reload --port 8000
```

### 5. Open in Browser

Navigate to: `http://localhost:8000`

You should see the dashboard with pre-loaded example audit data!

## Testing the API

### Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "service": "tinyfish-alp-showcase"}
```

### Run an Audit (Mock Mode)
```bash
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

This will return mock audit data for demonstration purposes.

## Frontend Features

1. **Pre-loaded Example**: Dashboard shows sample audit data immediately
2. **Run Your Own Audit**: Enter any URL in the form at the top
3. **Beautiful Visualizations**: Charts show issue distribution
4. **Detailed Issue Cards**: Click through issues to see agent impact
5. **Clear CTAs**: Upgrade prompts for full site audits

## Project Structure

```
tinyfish-alp-showcase/
├── backend/              # FastAPI backend
│   ├── main.py          # API routes
│   ├── models.py        # Data models
│   ├── tinyfish_client.py  # TinyFish integration (mock mode for MVP)
│   ├── prompts.py       # Audit prompt
│   └── config.py        # Configuration
│
├── frontend/            # Static frontend
│   ├── index.html       # Main dashboard
│   ├── loading.html     # Loading page (future use)
│   └── static/
│       ├── css/         # Styles
│       ├── js/          # JavaScript
│       └── data/        # Example audit data
│
├── requirements.txt     # Python dependencies
├── vercel.json         # Vercel deployment config
└── README.md           # Full documentation
```

## Deployment to Vercel

See [README.md](README.md) for full deployment instructions.

Quick version:

1. Push to GitHub
2. Import project in Vercel
3. Add `CEREBRAS_API_KEY` environment variable (if using real TinyFish)
4. Deploy!

## Troubleshooting

### Port 8000 already in use
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn backend.main:app --reload --port 8080
```

### Module not found errors
Make sure you're in the virtual environment:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend not loading
- Check that you're accessing `http://localhost:8000` (not 8080 or another port)
- Check browser console for errors
- Verify static files are being served from `/static/`

## Next Steps

- Read [README.md](README.md) for full documentation
- Explore the code in `backend/` and `frontend/`
- Customize the design in `frontend/static/css/styles.css`
- Add your own audit logic in `backend/tinyfish_client.py`
- Deploy to Vercel for production use

## Support

Questions? Issues? Open a GitHub issue or contact the team.

---

**Built with 🐟 by TinyFish**
