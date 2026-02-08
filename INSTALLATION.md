# Installation Guide

## Python Version Compatibility

This project works best with **Python 3.11 or 3.12**. Python 3.13 is supported with the latest dependency versions.

### Checking Your Python Version

```bash
python3 --version
```

### Installing a Specific Python Version (macOS)

If you need to install a specific Python version:

```bash
# Using Homebrew
brew install python@3.12

# Then create venv with that version
python3.12 -m venv venv
```

## Installation Steps

### Option 1: Quick Setup (Recommended)

```bash
cd tinyfish-alp-showcase

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run the server
python backend/main.py
```

Visit `http://localhost:8000` in your browser!

### Option 2: Using Uvicorn Directly

```bash
# After activating venv and installing requirements
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Development Mode (Auto-reload)

```bash
# Install development dependencies
pip install watchfiles

# Run with auto-reload
uvicorn backend.main:app --reload --port 8000
```

## Troubleshooting Installation Issues

### Issue: "ModuleNotFoundError: No module named 'pydantic'"

**Solution:** Make sure you've activated the virtual environment:
```bash
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Issue: "Failed building wheel for pydantic-core" (Python 3.13)

**Solution 1:** Update to latest requirements (already done in `requirements.txt`)

**Solution 2:** Use Python 3.11 or 3.12:
```bash
# Remove old venv
rm -rf venv

# Create new venv with Python 3.12
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "externally-managed-environment" Error

This happens on some macOS systems. **Solution:**
```bash
# Always use a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Port 8000 Already in Use

**Solution:**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn backend.main:app --reload --port 8080
```

### Issue: "command not found: python"

**Solution:** Use `python3` instead:
```bash
python3 -m venv venv
python3 backend/main.py
```

## Verifying Installation

After installation, verify everything works:

### 1. Check Python Version
```bash
python --version
# Should show 3.11.x or 3.12.x or 3.13.x
```

### 2. Check Dependencies
```bash
pip list | grep -E "fastapi|pydantic|uvicorn"
# Should show installed versions
```

### 3. Test Backend Health Check
```bash
# Start server in one terminal
python backend/main.py

# In another terminal, test health check
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"tinyfish-alp-showcase"}
```

### 4. Test Frontend
Open browser to `http://localhost:8000`
- You should see the dashboard with example audit data
- Charts should render
- No console errors

### 5. Test API Endpoint
```bash
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Should return JSON with audit results
```

## Environment Variables

### Required (For Production with Real TinyFish)
- `CEREBRAS_API_KEY` - Your Cerebras API key for TinyFish MCP

### Optional
- `GITHUB_TOKEN` - For version tracking (future use)

### Setting Environment Variables

**Development (.env file):**
```bash
cp .env.example .env
# Edit .env and add your keys
nano .env
```

**Production (Vercel):**
- Add in Vercel dashboard under Settings → Environment Variables

## Next Steps

After successful installation:

1. Read [QUICKSTART.md](QUICKSTART.md) for usage guide
2. Read [README.md](README.md) for full documentation
3. Try the example audits
4. Run your own audit
5. Deploy to Vercel (optional)

## Common Commands Reference

```bash
# Activate virtual environment
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Update dependencies
pip install --upgrade -r requirements.txt

# Run development server
python backend/main.py

# Run with auto-reload
uvicorn backend.main:app --reload

# Run on different port
uvicorn backend.main:app --port 8080

# Check what's using a port
lsof -i :8000

# Kill process on port
lsof -ti:8000 | xargs kill -9
```

## Platform-Specific Notes

### macOS
- Python 3 is usually pre-installed
- May need to use `python3` instead of `python`
- Homebrew recommended for managing Python versions

### Linux
- Most distributions have Python 3 pre-installed
- May need to install `python3-venv`: `sudo apt install python3-venv`
- May need to install `python3-dev` for building packages

### Windows
- Download Python from python.org
- Make sure to check "Add Python to PATH" during installation
- Use `py` instead of `python3`
- Use backslashes in paths: `venv\Scripts\activate`

## Getting Help

If you encounter issues:

1. Check this installation guide
2. Check [QUICKSTART.md](QUICKSTART.md)
3. Check the error message carefully
4. Search for the error online
5. Check Python version compatibility
6. Try recreating the virtual environment
7. Open a GitHub issue with error details

---

**Built with 🐟 by TinyFish**
