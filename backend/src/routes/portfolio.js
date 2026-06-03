const express = require("express");
const { borrowers, users } = require("../data/mockData");
const { scoreBorrower } = require("../services/riskEngine");
const { generatePortfolioSummary } = require("../services/llmService");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, requireRole("analyst"));

router.get("/summary", async (req, res) => {
  const analystUser = users.find(u => u.id === req.user.id);
  const assigned = analystUser?.assignedBorrowers || [];
  const filtered = borrowers.filter(b => assigned.includes(b.id));
  const alerts = filtered.map(scoreBorrower);

  const distribution = alerts.reduce((acc, a) => {
    acc[a.riskCategory] = (acc[a.riskCategory] || 0) + 1;
    return acc;
  }, { Low: 0, Watchlist: 0, "High Risk": 0, Critical: 0 });

  const avgScore = alerts.length ? Math.round(alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length) : 0;
  const totalOutstanding = alerts.reduce((s, a) => s + a.outstandingBalance, 0);
  const atRiskOutstanding = alerts
    .filter(a => ["High Risk", "Critical"].includes(a.riskCategory))
    .reduce((s, a) => s + a.outstandingBalance, 0);

  let llmSummary = null;
  try {
    llmSummary = await generatePortfolioSummary(alerts);
  } catch {
    llmSummary = "Portfolio summary unavailable.";
  }

  res.json({
    totalBorrowers: alerts.length,
    distribution,
    averageRiskScore: avgScore,
    totalOutstandingBalance: totalOutstanding,
    atRiskOutstandingBalance: atRiskOutstanding,
    atRiskPercentage: totalOutstanding > 0 ? Math.round((atRiskOutstanding / totalOutstanding) * 100) : 0,
    executiveSummary: llmSummary,
    topRiskBorrowers: alerts
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map(a => ({ borrowerId: a.borrowerId, name: a.borrowerName, category: a.riskCategory, score: a.riskScore }))
  });
});

module.exports = router;
