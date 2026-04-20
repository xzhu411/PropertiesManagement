# AI-Powered Residential AM Tool

> 🏢 AI-powered residential asset management for private equity real estate firms.

## 🎬 Demo (click the image and watch the full demo!)

[![Demo Video](https://img.youtube.com/vi/8_Q6q_fzPTU/0.jpg)](https://youtu.be/8_Q6q_fzPTU)

| Timestamp | Section |
|-----------|---------|
| [0:00](https://youtu.be/8_Q6q_fzPTU?t=0) | Intro & architecture |
| [2:44](https://youtu.be/8_Q6q_fzPTU?t=164) | Portfolio dashboard |
| [7:27](https://youtu.be/8_Q6q_fzPTU?t=447) | Tenant screening & FHA compliance |

## 🔧 What This Builds

**Two modules:**

### 1. Portfolio Dashboard (`/dashboard`)
- Real-time KPIs: NOI, occupancy, rent collection, DSCR, lease expirations
- 12-month NOI trend vs. budget (Recharts)
- Property cards with DSCR badges, LTV, cap rate vs. benchmark
- Lease Rollover Concentration — 30/60/90d toggle with weekly/15-day/monthly buckets
- **AI Risk Feed** — Claude analyzes live portfolio data (occupancy, DSCR, collection rates, lease urgency) and generates risk alerts in real time. Cached in memory after first load.
- **Draft Notice Agent** — click any URGENT/WATCH alert to stream a legally compliant tenant notice (city-specific citations: Texas Property Code §91.001, Austin City Code, NYC Admin Code)
- Rent Optimization Panel — expected value math per unit type, not just "raise rent X%"

### 2. Tenant Screening (`/screening`)
- 5 preset applicant profiles covering every screening scenario
- **Two-call Claude architecture**: structured JSON → streaming narrative
- Income-to-rent ratio gauge (3x institutional standard)
- **FHA Compliance Layer**: rule-based pre-check + Claude contextual analysis for Fair Housing Act exposure
- **12-Month NPV Impact Model**: vacancy probability × cost + eviction probability × cost vs. market average
- Risk flag accordion with mitigants
- Conditions checklist with progress tracking

## 🤖 What's Actually AI vs. Python

| Component | What runs it |
|---|---|
| AI Risk Feed alerts | **Claude** — analyzes portfolio data on first load, cached |
| Draft Notice text | **Claude** — streams a city-specific legal notice |
| Screening recommendation + risk flags | **Claude** — structured JSON (Call 1) |
| Screening narrative | **Claude** — SSE streaming (Call 2) |
| NPV / vacancy / eviction model | **Pure Python** — `screening_engine.py`, deterministic |
| FHA pre-check | **Pure Python** — `fha_checker.py`, rule-based |
| Portfolio KPIs, NOI chart, lease table | Mock data |

## 📐 The Financial Model

The NPV math lives in **pure Python** (`backend/services/screening_engine.py`) — not inside Claude's prompt. Claude receives pre-computed numbers and provides contextual analysis. This is intentional: financial exposure calculations should not depend on LLM output variability.
Assumptions: vacancy cost = $3,200 (1 month rent + $800 turn), eviction cost = $6,500 (legal + 2 months lost rent + turn).

## ⚖️ The FHA Compliance Layer

Two-tier approach:

1. **Rule-based pre-check** (`fha_checker.py`): deterministic, checks for Section 8/HCV income, disability accommodation signals, familial status, national origin
2. **Claude contextual analysis**: receives pre-check flags as context, validates and adds narrative guidance

Key scenario: A3 (Rosa Gutierrez) — Section 8 Housing Choice Voucher holder. Naive rejection of "non-traditional income" triggers a Fair Housing Act flag citing **Austin City Code § 5-11-41**. The system identifies the compliant path: evaluate combined income (wages + voucher = $5,300/mo) against the 3x rent standard.

## 🏘️ Mock Portfolio

| Property | City | Units | NOI/yr | Cap Rate | Risk |
|---|---|---|---|---|---|
| Oakwood Apartments | Chicago, IL | 84 | $991K | 5.90% | WATCH |
| Riverside Commons | Austin, TX | 156 | $1.83M | 4.76% | HIGH — collection 91.2%, DSCR 1.24x |
| Lincoln Park Tower | New York, NY | 48 | $1.22M | 4.21% | STABLE |
| Sunset Ridge | Phoenix, AZ | 200 | $1.65M | 5.31% | HIGH — occupancy 89.5% |

Portfolio: 488 units · $5.68M NOI · 4.94% blended cap rate vs. CBRE Q4 2024 multifamily benchmark 5.20%.

## 📁 Project Structure

```
backend/
├── main.py                    # FastAPI app, CORS, router registration
├── config.py                  # Settings, API key via pydantic-settings
├── routers/
│   ├── portfolio.py           # Portfolio endpoints + SSE draft notice
│   ├── screening.py           # Tenant screening endpoints (full + stream)
│   └── analytics.py          # Rent optimization
├── services/
│   ├── claude_service.py      # Two-call Claude architecture + risk alerts
│   ├── screening_engine.py    # Pure Python NPV/vacancy/eviction model
│   └── fha_checker.py        # Deterministic FHA pre-check, city ordinance dict
└── data/
├── mock_portfolio.py      # 4 properties, 488 units, NOI trend, lease data
└── mock_applicants.py     # 5 preset applicant profiles
frontend/
├── src/app/
│   ├── dashboard/page.tsx     # Portfolio dashboard page
│   └── screening/page.tsx     # Tenant screening page
├── src/components/
│   ├── dashboard/
│   │   ├── AIRiskFeed.tsx         # Claude-generated risk alerts
│   │   ├── DraftNoticeModal.tsx   # SSE streaming legal notice
│   │   └── PortfolioKPIBar.tsx    # NOI, occupancy, DSCR, collection KPIs
│   └── screening/
│       ├── AgentNarrative.tsx     # Call 2 — SSE streaming terminal UI
│       ├── FHACompliancePanel.tsx # FHA flag display with legal citations
│       ├── NPVImpactModel.tsx     # 12-month NPV table
│       └── RiskFlagAccordion.tsx  # Risk flags with mitigants
```

## 🛠 Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + Pydantic v2 + Anthropic Python SDK |
| AI | Claude claude-sonnet-4-6 — risk alerts, draft notices, screening (2-call) |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Charts | Recharts |
| Data | Realistic US rental market mock data |

## 🚀 Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Anthropic API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

uvicorn main:app --reload --port 8000
```

API at `http://localhost:8000` · Docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App at `http://localhost:3000`

## 📡 Key Endpoints

```
GET  /api/portfolio/summary               → Portfolio KPIs
GET  /api/portfolio/properties            → All 4 properties
GET  /api/portfolio/noi-trend             → 12-month NOI series
GET  /api/portfolio/lease-expiry          → Upcoming expirations
GET  /api/portfolio/risk-alerts           → Claude-generated risk alerts (cached)
GET  /api/analytics/rent-optimization     → EV-based rent suggestions
POST /api/portfolio/draft-notice          → SSE stream — legal notice from alert
GET  /api/applicants/presets              → 5 demo applicant profiles
POST /api/screen-tenant/full              → Structured JSON underwriting
POST /api/screen-tenant/stream            → SSE streaming narrative
```

