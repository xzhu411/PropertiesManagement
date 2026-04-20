# Residential AM

> AI-powered residential asset management for private equity real estate firms.


## What This Builds

**Two modules:**

### 1. Portfolio Dashboard (`/dashboard`)
- Real-time KPIs: NOI, occupancy, rent collection, lease expirations
- 12-month NOI trend vs. budget (Recharts)
- Property cards with AI risk scores and cap rate vs. CRE benchmark
- Lease expiry heat map with urgency flagging
- AI Risk Feed — terminal-style scrolling alerts
- Rent Optimization Panel — expected value math, not just "raise rent X%"

### 2. Tenant Screening (`/screening`)
- 5 preset applicant profiles covering every screening scenario
- **Two-call Claude architecture**: structured JSON → streaming narrative (matches Plaza's existing agent UX)
- Income-to-rent ratio gauge (3x institutional standard)
- **FHA Compliance Layer**: rule-based pre-check + Claude contextual analysis for Fair Housing Act exposure
- **12-Month NPV Impact Model**: vacancy probability × cost + eviction probability × cost vs. market average
- Risk flag accordion with mitigants
- Streaming terminal narrative styled like Plaza's plaza-agent interface

## The Financial Model

The NPV math lives in **pure Python** (`backend/services/screening_engine.py`) — not inside Claude's prompt. Claude receives pre-computed numbers and provides contextual analysis. This is intentional: you don't want financial exposure calculations to depend on LLM output variability.

```
P(vacancy) = base_rate × credit_factor × employment_factor × payment_factor × history_factor
P(eviction) = base_rate × eviction_history × credit_factor × payment_factor

12-mo Expected Net Revenue = Rent × 12 × (1 - P(vacancy)) - Eviction_Cost × P(eviction)
Delta = Applicant_Revenue - Market_Average_Revenue
```

Assumptions: vacancy cost = $3,200 (1 month rent + $800 turn), eviction cost = $6,500 (legal + 2 months lost rent + turn), discount rate = 7.5%.

## The FHA Compliance Layer

Two-tier approach mirroring regulated-industry software:

1. **Rule-based pre-check** (`fha_checker.py`): deterministic, auditable, checks for Section 8/HCV income, disability accommodation signals, familial status, national origin
2. **Claude contextual analysis**: receives pre-check flags as context, validates and adds narrative guidance

Key scenario: A3 (Rosa Gutierrez) — applicant with Section 8 Housing Choice Voucher. Naive rejection of "non-traditional income" triggers a Fair Housing Act compliance flag citing **Austin City Code § 5-11-41** (source-of-income anti-discrimination ordinance). The system identifies the compliant alternative: evaluate total combined income (wages + voucher subsidy = $5,300/mo) against the 3x rent standard.

## Mock Portfolio

| Property | City | Units | NOI/yr | Cap Rate | Risk |
|---|---|---|---|---|---|
| Oakwood Apartments | Chicago, IL | 84 | $991K | 5.90% | WATCH |
| Riverside Commons | Austin, TX | 156 | $1.83M | 4.76% | HIGH (collection 91.2%) |
| Lincoln Park Tower | New York, NY | 48 | $1.22M | 4.21% | STABLE |
| Sunset Ridge | Phoenix, AZ | 200 | $1.65M | 5.31% | HIGH (occupancy 89.5%) |

Portfolio: 488 units · $5.68M NOI · 4.94% blended cap rate vs. CBRE Q4 2024 multifamily benchmark of 5.20%.

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + Pydantic + Anthropic Python SDK |
| AI | Claude claude-sonnet-4-6 (two-call: JSON + SSE streaming) |
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| UI | shadcn/ui (dark theme) + Recharts |
| Data | Realistic US rental market mock data |

## Setup

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

# Set your API key in .env
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:3000`.

## Key Endpoints

```
GET  /api/portfolio/summary          → Portfolio KPIs
GET  /api/portfolio/properties       → All properties
GET  /api/portfolio/noi-trend        → 12-month NOI series
GET  /api/portfolio/lease-expiry     → Upcoming expirations
GET  /api/portfolio/risk-alerts      → AI risk feed
GET  /api/analytics/rent-optimization → EV-based rent suggestions
GET  /api/applicants/presets         → 5 demo applicant profiles
POST /api/screen-tenant/full         → Structured JSON underwriting result
POST /api/screen-tenant/stream       → SSE streaming narrative
```

## Demo Flow (for video)

1. **Dashboard** — Show portfolio KPIs, highlight Riverside Commons (91.2% collection flagged), Sunset Ridge (89.5% occupancy below floor). Click rent optimization to show EV math.
2. **Screening — Sarah Chen (A1)** — Baseline approved applicant. Show how both panels populate simultaneously (structured JSON instant, narrative streams).
3. **Screening — Rosa Gutierrez (A3)** — The FHA demo. Select her profile, analyze. Watch the FHA compliance panel light red. Explain the Austin source-of-income ordinance catch. Show the NPV delta.
4. **Architecture callout** — "The vacancy probability formula lives in Python, not in Claude's prompt. You don't want your financial model to depend on whether the LLM is in a good mood."
