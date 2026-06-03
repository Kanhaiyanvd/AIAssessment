const axios = require("axios");

const LLM_URL = process.env.LLM_API_URL;
const LLM_TOKEN = process.env.LLM_API_TOKEN;

async function generateExplanation(borrowerAlert) {
  const { borrowerName, borrowerId, riskCategory, riskScore, signals, actions, loanAmount, emiAmount, outstandingBalance, creditUtilization, failedAutoDebits, paymentHistory } = borrowerAlert;

  const recentPayments = paymentHistory.slice(0, 3).map(p =>
    `${p.date}: ${p.status}${p.daysLate > 0 ? ` (${p.daysLate} days late)` : ""}`
  ).join("; ");

  const prompt = `You are a credit risk analyst AI assistant. A borrower has been flagged by our early warning system. Generate a concise, factual risk explanation grounded ONLY in the data provided below. Do not add assumptions beyond the given data.

BORROWER DATA:
- Borrower ID: ${borrowerId}
- Name: ${borrowerName}
- Risk Category: ${riskCategory} (Score: ${riskScore}/100)
- Loan Amount: ₹${loanAmount.toLocaleString()}
- EMI Amount: ₹${emiAmount.toLocaleString()}
- Outstanding Balance: ₹${outstandingBalance.toLocaleString()}
- Credit Utilization: ${creditUtilization}%
- Failed Auto-Debits: ${failedAutoDebits}
- Recent Payment History: ${recentPayments}
- Risk Signals Detected: ${signals.join("; ")}
- Recommended Actions: ${actions.join("; ")}

Provide:
1. A 2-3 sentence plain-English explanation of why this borrower was flagged.
2. The top 2 most critical risk factors.
3. A brief rationale for the recommended actions.

Keep the tone professional and factual. Only reference data provided above.`;

  const response = await axios.post(
    `${LLM_URL}/llm/query`,
    { prompt, metadata: { borrowerId, traceId: `risk-alert-${borrowerId}-${Date.now()}` } },
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_TOKEN}` } }
  );

  return response.data?.response || response.data?.text || response.data;
}

async function answerAnalystQuery(question, borrowerAlert) {
  const { borrowerName, borrowerId, riskCategory, riskScore, signals, actions, loanAmount, emiAmount, outstandingBalance, creditUtilization, failedAutoDebits, paymentHistory, recentTransactions } = borrowerAlert;

  const recentPayments = paymentHistory.slice(0, 3).map(p =>
    `${p.date}: ${p.status}${p.daysLate > 0 ? ` (${p.daysLate} days late)` : ""}, amount: ₹${p.amount}`
  ).join("; ");

  const transactions = (recentTransactions || []).slice(0, 5).map(t =>
    `${t.date}: ${t.type} ₹${t.amount} (${t.description})`
  ).join("; ");

  const prompt = `You are a credit risk analyst AI. Answer the analyst's question using ONLY the borrower data provided. If the answer cannot be determined from the data, say so explicitly. Do not fabricate information.

BORROWER DATA:
- Borrower ID: ${borrowerId}
- Name: ${borrowerName}
- Risk Category: ${riskCategory} (Score: ${riskScore}/100)
- Loan Amount: ₹${loanAmount.toLocaleString()}
- EMI Amount: ₹${emiAmount.toLocaleString()}
- Outstanding Balance: ₹${outstandingBalance.toLocaleString()}
- Credit Utilization: ${creditUtilization}%
- Failed Auto-Debits: ${failedAutoDebits}
- Recent Payments: ${recentPayments}
- Recent Transactions: ${transactions}
- Risk Signals: ${signals.join("; ")}
- Recommended Actions: ${actions.join("; ")}

ANALYST QUESTION: ${question}

Answer concisely and factually, citing specific data points from above.`;

  const response = await axios.post(
    `${LLM_URL}/llm/query`,
    { prompt, metadata: { borrowerId, queryType: "analyst_query", traceId: `query-${borrowerId}-${Date.now()}` } },
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_TOKEN}` } }
  );

  return response.data?.response || response.data?.text || response.data;
}

async function generatePortfolioSummary(alerts) {
  const categoryCounts = alerts.reduce((acc, a) => {
    acc[a.riskCategory] = (acc[a.riskCategory] || 0) + 1;
    return acc;
  }, {});

  const criticalBorrowers = alerts.filter(a => a.riskCategory === "Critical").map(a => a.borrowerName).join(", ");
  const highRiskBorrowers = alerts.filter(a => a.riskCategory === "High Risk").map(a => a.borrowerName).join(", ");
  const avgScore = Math.round(alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length);

  const prompt = `You are a portfolio risk manager AI. Generate a concise executive summary of the loan portfolio risk status based on the data below.

PORTFOLIO DATA:
- Total Borrowers: ${alerts.length}
- Risk Distribution: ${JSON.stringify(categoryCounts)}
- Average Risk Score: ${avgScore}/100
- Critical Borrowers: ${criticalBorrowers || "None"}
- High Risk Borrowers: ${highRiskBorrowers || "None"}

Provide a 3-4 sentence executive summary covering: overall portfolio health, most urgent concerns, and key recommended actions for the collections team.`;

  const response = await axios.post(
    `${LLM_URL}/llm/query`,
    { prompt, metadata: { queryType: "portfolio_summary" } },
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_TOKEN}` } }
  );
  console.log(response, 'line no 110 llm service')
  return response.data?.response || response.data?.text || response.data;
}

module.exports = { generateExplanation, answerAnalystQuery, generatePortfolioSummary };
