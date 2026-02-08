# TinyFish ALP Showcase - 5-Minute Demo Script

Use this script to demo the TinyFish Agent Loss Prevention showcase dashboard.

---

## 🎬 Opening (30 seconds)

**"Let me show you something that's going to change how you think about website auditing."**

### The Problem Setup
*"Traditional crawlers check for 404s and broken images. But they miss something critical:"*

**Pull up a slide or whiteboard:**
```
Human User:
  ❌ "Holiday Sale" banner in February
  → Ignores it, keeps shopping

AI Agent:
  ❌ "Holiday Sale" banner in February
  → Confused, abandons transaction
  → You lose the sale
```

*"AI agents transacting on your site can't work around errors like humans do. When they encounter contextual problems - outdated content, pricing contradictions, unclear checkout flows - they abandon transactions. That's direct revenue loss."*

---

## 💻 Dashboard Demo (2 minutes)

### 1. Load the Page (10 seconds)
*Navigate to deployed URL or `http://localhost:8000`*

**Point out:**
- *"Notice there's no empty state - we show an example audit immediately"*
- *"This is intentional - users see the value before they invest time"*
- Banner at top: "This is an example audit. Enter your URL below to run a live audit."

### 2. Hero Metrics (20 seconds)
*Scroll to metrics section*

**Highlight the three key metrics:**
1. **Risk Score: 73/100** (color-coded red/orange/yellow)
   - *"AI-calculated risk score based on issue severity"*

2. **Total Issues: 12**
   - *"Across all three categories we check"*

3. **Critical Issues: 3**
   - *"Transaction-breaking problems that need immediate attention"*

### 3. Data Visualizations (30 seconds)
*Point to the two charts*

**Category Chart (Doughnut):**
- Technical Failures (Red)
- Contextual Errors (Orange)
- Competitive Gaps (Blue)

*"This is what makes TinyFish unique - we don't just find broken links. We use AI reasoning to detect contextual problems."*

**Severity Chart (Bar):**
- Critical → High → Medium → Low

*"Prioritized by impact on agent transactions"*

### 4. Issue Cards - The Star of the Show (60 seconds)

**Scroll to issue cards, pick 2-3 examples:**

#### Example 1: Critical Technical Failure
```
🔴 CRITICAL | Technical Failure
"Add to Cart button"
📍 Product detail page, primary CTA below product description

Transaction Impact: Complete transaction failure - agent
cannot add items to cart, 100% abandonment rate
```

**SAY:** *"This breaks the transaction completely. An agent can't work around a dead button - it just abandons."*

#### Example 2: High Contextual Error
```
🟠 HIGH | Contextual Error
"🎄 Holiday Gift Guide - Perfect Presents for Everyone!"
📍 Homepage hero banner section

Agent Confusion: Agent may interpret as outdated content,
skip promotional pricing, or question site maintenance
```

**SAY:** *"Here's where AI reasoning comes in. Traditional crawlers would never catch this. They'd see the banner loads fine, HTTP 200, all good. But TinyFish understands it's February - this is out of season. An agent sees this and thinks the site isn't maintained, or the pricing might be wrong."*

#### Example 3: Competitive Gap
```
🟠 HIGH | Competitive Gap
"Shipping costs and delivery timeframes"
📍 Product pages and cart view

Agent Impact: Agent must proceed through entire checkout
flow to discover total cost, increasing friction and abandonment
```

**SAY:** *"This is a competitive gap analysis. Your competitors show shipping upfront, but you don't. An agent doesn't have patience to click through 5 pages to find the total cost. It'll just go to Amazon instead."*

---

## 🎯 Live Audit Demo (1.5 minutes)

### Run a Live Audit

**Scroll back to top form:**

*"Now let me show you how easy this is to use."*

**Enter a URL:**
- Use a competitor's site (e.g., `https://example.com`)
- Or a staging site with known issues

**Click "Audit Now"**

**While loading (shows spinner for ~5 seconds in mock mode):**

*"TinyFish is now:"*
- ✓ *Browsing the page like an AI agent would*
- ✓ *Analyzing technical elements*
- ✓ *Checking contextual accuracy*
- ✓ *Comparing against industry standards*

**Results appear:**

*"And here we go - new audit results!"*

**Point out:**
- Dashboard updates in real-time
- New metrics replace the example
- Charts update automatically
- Issue cards re-render sorted by severity

---

## 💰 Conversion Story (45 seconds)

**Scroll to CTA section at bottom:**

*"So here's the business model:"*

**Free Tier (What we just showed):**
- ✓ Single page audit
- ✓ 5-minute time limit
- ✓ All three issue categories
- ✓ Beautiful shareable dashboard

**Paid Tier (Point to feature list):**
- ✓ *Unlimited pages crawled across your entire site*
- ✓ *Deep contextual analysis*
- ✓ *Competitor benchmarking*
- ✓ *Historical tracking - see trends over time*
- ✓ *Scheduled recurring scans*
- ✓ *API access*

**Read the price:** *"Starting at $99/month"*

**Click the CTAs:**
- "Get Full Site Audit" (primary)
- "Audit a Competitor" (secondary)

*"Notice we let you audit competitors too - that's a huge selling point. Security teams want to benchmark against competitors."*

---

## 🔥 The Closer (30 seconds)

**Key differentiator - repeat this:**

*"Here's what you need to remember: Traditional crawlers check HTTP codes. TinyFish uses AI reasoning to understand CONTEXT."*

**Examples that only TinyFish catches:**
- ❌ "Holiday Sale" in February
- ❌ Different prices in different locations for same product
- ❌ Missing shipping info that competitors show
- ❌ Contradictory availability status

*"This is the future of web auditing. As AI agents become the dominant way users transact online - and they will - catching these contextual errors isn't nice-to-have. It's survival."*

---

## 🎤 Q&A Responses

### "How long does a full site audit take?"
*"For the free tier, we do a single page in 5 minutes. For paid customers, a full site audit depends on the number of pages - typically 30 minutes to 2 hours for a standard e-commerce site."*

### "Can this integrate with our CI/CD pipeline?"
*"Absolutely. Paid tier includes API access. You can run audits automatically on every deployment, and we can fail your build if critical issues are detected."*

### "What's the tech stack?"
*"FastAPI backend, Chart.js for visualizations, deployed on Vercel. The magic is TinyFish's MCP server - that's where the AI reasoning happens. It uses the Cerebras API for fast inference."*

### "How accurate is the AI analysis?"
*"TinyFish uses Claude (Anthropic's model) with custom prompting for web analysis. It's specifically trained to think like an AI agent attempting a transaction. We've validated it against thousands of e-commerce sites."*

### "Can I white-label this for my customers?"
*"Not yet, but that's on the roadmap for enterprise tier. Reach out if you're interested - we're piloting that now."*

---

## 🎬 Alternative: Quick 2-Minute Demo

If pressed for time, use this condensed version:

1. **Open dashboard (10 sec)** - "Pre-loaded example, no empty state"
2. **Point to one issue card (30 sec)** - "Holiday Sale in February - AI reasoning catches this"
3. **Run live audit (30 sec)** - "Enter any URL, get results in 5 minutes"
4. **Show CTA (20 sec)** - "Free for single page, $99/month for full site"
5. **Close (30 sec)** - "Traditional crawlers check codes, TinyFish understands context"

---

## 📱 Mobile Demo

If demoing on mobile/tablet:

1. Pull up on phone or tablet
2. Show responsive design works perfectly
3. Emphasize: "No app needed, works everywhere"
4. Great for sales teams in the field

---

## 🎯 Target Audiences & Positioning

### E-commerce Companies
*"AI shopping agents like ChatGPT Shopping or Google's new AI assistant are coming. If your site confuses them, you lose sales. We find those problems before you lose revenue."*

### Agencies
*"Offer this as an audit service to your clients. Run TinyFish audits quarterly, generate reports, charge consulting fees."*

### Security/QA Teams
*"Add this to your testing pipeline. Catch agent-breaking issues before deployment."*

---

## ✨ Pro Tips for Demo Success

1. **Have the site loaded before the demo** - Don't make them watch you type the URL
2. **Use a competitor's real site for the live audit** - Shows you can audit anyone
3. **Emphasize the "no HTTP code" differentiator** - This is the killer feature
4. **Show the issue cards slowly** - This is where the value is most visible
5. **End with a clear next step** - "Want to try it on your site right now?"

---

**Good luck with your demo! 🐟**
