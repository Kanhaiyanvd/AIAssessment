# LoanGuard AI — Loan Default Risk Early Warning System

A full-stack prototype for proactively identifying borrowers at risk of delinquency within the next 30 days, built with Node.js (Express) + React.js.

---

## Quick Start

### Backend
```bash
cd backend
npm install
npm start          # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:3000
```

### Demo Login Credentials

| Role     | Username  | Password | Description                    |
|----------|-----------|----------|--------------------------------|
| Analyst  | analyst1  | pass123  | Assigned: B101, B102, B105, B107 |
| Analyst  | analyst2  | pass123  | Assigned: B103, B104, B106, B108 |
| Borrower | rahul     | pass123  | Borrower B101 (Low risk)       |
| Borrower | rohit     | pass123  | Borrower B107 (Critical risk)  |

---

## System Architecture

```
frontend (React + Vite)
    │
    └── REST API calls
            │
    backend (Express.js)
        ├── /api/auth          — simulated JWT auth
        ├── /api/borrowers     — risk alerts + LLM explanations
        └── /api/portfolio     — portfolio summary
            │
    services/
        ├── riskEngine.js      — rule-based scoring (no ML)
        └── llmService.js      — calls LLM wrapper for explanations
```

---

## Risk Scoring Logic

Risk is calculated using a weighted heuristic scoring model. Each signal contributes points; the total is capped at 100.

### Signals & Thresholds

| Signal | Condition | Points |
|--------|-----------|--------|
| **DPD Trend** | 2+ missed EMIs in last 3 months | 35 |
| | 1 missed EMI | 20 |
| | Partial payment(s) | 10 |
| | Avg delay > 15 days | 15 |
| | Avg delay > 7 days | 8 |
| | Worsening delay trend (month-over-month) | 10 |
| **Failed Auto-Debits** | ≥ 4 failures | 20 |
| | 2–3 failures | 12 |
| | 1 failure | 5 |
| **Credit Utilization** | ≥ 90% | 20 |
| | ≥ 75% | 12 |
| | ≥ 60% | 6 |
| **Income Decline** | ≥ 60% drop vs avg | 20 |
| | ≥ 30% drop | 12 |
| | ≥ 15% drop | 5 |
| **Balance Risk** | Very low repayment progress + missed payments | 10 |

### Risk Categories

| Score | Category  |
|-------|-----------|
| 0–24  | Low       |
| 25–49 | Watchlist |
| 50–74 | High Risk |
| 75–100| Critical  |

---

## Mock Data Schema

```json
{
  "id": "B101",
  "name": "Rahul Sharma",
  "loanAmount": 500000,
  "emiAmount": 12500,
  "outstandingBalance": 410000,
  "dueDates": ["2026-05-01", "2026-06-01"],
  "paymentHistory": [
    { "date": "2026-05-01", "status": "paid|missed|partial", "daysLate": 0, "amount": 12500 }
  ],
  "failedAutoDebits": 0,
  "creditUtilization": 0.35,
  "recentTransactions": [
    { "date": "2026-05-28", "type": "credit|debit", "amount": 55000, "description": "Salary" }
  ],
  "avgMonthlyIncome": 55000,
  "lastMonthIncome": 55000,
  "assignedAnalyst": "analyst1"
}
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | None | Returns JWT token |
| GET | `/api/borrowers` | Analyst | List assigned borrowers by risk severity |
| GET | `/api/borrowers/:id` | Analyst/Borrower | Full risk alert for borrower |
| GET | `/api/borrowers/:id/explain` | Analyst | LLM-generated risk explanation |
| POST | `/api/borrowers/:id/query` | Analyst | Natural language query about borrower |
| POST | `/api/borrowers/:id/simulate` | Analyst | Scenario simulation |
| GET | `/api/portfolio/summary` | Analyst | Portfolio-level risk overview |

### Scenario Simulation Options
- `next_emi_missed` — Simulate missing the next EMI
- `income_drop_50` — Simulate 50% income reduction
- `utilization_spike` — Simulate +20% credit utilization

---

## Security & Privacy Design

### Implemented (simulated auth)
- **JWT-based authentication** — tokens expire in 8 hours
- **Role-based access control (RBAC)**:
  - `analyst` — can view only their assigned borrowers, run queries, simulate scenarios
  - `borrower` — can view only their own data (limited fields: risk status, signals, actions, payment history)
- **Data isolation** — analysts cannot cross-access each other's assigned borrowers
- **Borrowers cannot see** raw scores, LLM explanations, or full transaction data

### In a Real Implementation
- **Authentication**: OAuth 2.0 / SSO (Okta, Auth0) with MFA for analysts
- **Data encryption**: TLS in transit, AES-256 at rest; PII fields encrypted at column level
- **Audit logging**: Every data access event logged with user, timestamp, and borrower ID
- **Data minimization**: LLM prompts include only necessary fields — never full PAN/Aadhaar
- **Role management**: Analyst assignment managed via admin panel, not hardcoded
- **Rate limiting**: LLM query endpoint rate-limited per analyst to prevent abuse

---

## LLM Integration & Grounding Safeguards

- All LLM prompts are **strictly constrained** to available borrower data — no external knowledge used
- Prompts explicitly instruct the model: *"answer only using available data, do not fabricate"*
- Each LLM call includes a `traceId` for auditability
- Responses are clearly labeled as AI-generated in the UI
- If LLM service is unavailable, the system degrades gracefully (rule-based data still shown)

---

## Test Scenarios

| Borrower | Profile | Expected Category |
|----------|---------|-------------------|
| B101 (Rahul) | On-time payments, low utilization | Low |
| B102 (Priya) | 1 failed debit, rising utilization, income dip | Low/Watchlist |
| B103 (Amit) | 1 missed EMI, 3 failed debits, 85% utilization, income crashed | Critical |
| B104 (Sneha) | 2 consecutive misses, 4 failed debits, 91% utilization | Critical |
| B105 (Vikram) | Perfect history, high income | Low |
| B106 (Kavya) | Late payments, 2 failed debits, 72% utilization | Watchlist/High Risk |
| B107 (Rohit) | 3 consecutive misses, 5 failed debits, income near zero | Critical |
| B108 (Ananya) | Perfect record, good income | Low |

**Edge cases handled:**
- Zero income history → flagged with "Insufficient income history" signal
- Missing payment data → score calculated from available signals only
- Score capped at 100 to prevent extreme outliers skewing the UI

---

## Assumptions & Trade-offs

- **No ML model**: Rule-based scoring is transparent and auditable, preferred in regulated fintech
- **Mock data**: Payment history limited to 3 months — real system would use 12–24 months
- **Simulated auth**: JWT secret is static; production would use a secrets manager (AWS KMS)
- **No DB**: Data lives in memory; production would use PostgreSQL with row-level security
- **LLM grounding**: Prompts are instruction-based, not RAG — sufficient for structured data; RAG would be better for policy documents
- **Utilization data**: Assumed to be available from credit bureau feeds in production

---

## Bonus Features Implemented

- ✅ Risk trend visualization (score breakdown bar chart, pie chart on Portfolio page)
- ✅ Scenario simulation ("What if next EMI is missed?")
- ✅ Portfolio-level risk summary with AI executive brief
- ✅ Analyst natural language query ("Why was B107 flagged?")
- ✅ Borrower self-service view (limited data, RBAC enforced)
