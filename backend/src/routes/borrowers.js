const express = require("express");
const { borrowers } = require("../data/mockData");
const { scoreBorrower, simulateScenario } = require("../services/riskEngine");
const { generateExplanation, answerAnalystQuery } = require("../services/llmService");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Analysts see their assigned borrowers; borrowers see only themselves
router.get("/", requireRole("analyst"), (req, res) => {
  const { users } = require("../data/mockData");
  const analystUser = users.find(u => u.id === req.user.id);
  const assigned = analystUser?.assignedBorrowers || [];
  const filtered = borrowers.filter(b => assigned.includes(b.id));
  const alerts = filtered.map(scoreBorrower).sort((a, b) => b.severity - a.severity);
  res.json({ total: alerts.length, borrowers: alerts.map(a => ({
    borrowerId: a.borrowerId,
    borrowerName: a.borrowerName,
    riskCategory: a.riskCategory,
    riskScore: a.riskScore,
    severity: a.severity,
    topSignals: a.signals.slice(0, 2),
    actions: a.actions.slice(0, 2)
  }))});
});

// Get specific borrower — analyst gets full data, borrower gets limited view
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const borrower = borrowers.find(b => b.id === id);
  if (!borrower) return res.status(404).json({ error: "Borrower not found" });

  if (req.user.role === "borrower") {
    if (req.user.borrowerId !== id) {
      return res.status(403).json({ error: "Access denied: you can only view your own data" });
    }
    const alert = scoreBorrower(borrower);
    return res.json({
      borrowerId: alert.borrowerId,
      riskCategory: alert.riskCategory,
      signals: alert.signals,
      actions: alert.actions,
      paymentHistory: alert.paymentHistory
    });
  }

  const { users } = require("../data/mockData");
  const analystUser = users.find(u => u.id === req.user.id);
  if (!analystUser?.assignedBorrowers?.includes(id)) {
    return res.status(403).json({ error: "Access denied: borrower not assigned to you" });
  }

  res.json(scoreBorrower(borrower));
});

// LLM explanation for an alert
router.get("/:id/explain", requireRole("analyst"), async (req, res) => {
  const { id } = req.params;
  const { users } = require("../data/mockData");
  const analystUser = users.find(u => u.id === req.user.id);
  if (!analystUser?.assignedBorrowers?.includes(id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const borrower = borrowers.find(b => b.id === id);
  if (!borrower) return res.status(404).json({ error: "Borrower not found" });

  try {
    const alert = scoreBorrower(borrower);
    const explanation = await generateExplanation(alert);
    res.json({ borrowerId: id, explanation, riskCategory: alert.riskCategory, riskScore: alert.riskScore });
  } catch (err) {
    res.status(500).json({ error: "LLM service error", details: err.message });
  }
});

// Analyst natural language query about a borrower
router.post("/:id/query", requireRole("analyst"), async (req, res) => {
  const { id } = req.params;
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  const { users } = require("../data/mockData");
  const analystUser = users.find(u => u.id === req.user.id);
  if (!analystUser?.assignedBorrowers?.includes(id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const borrower = borrowers.find(b => b.id === id);
  if (!borrower) return res.status(404).json({ error: "Borrower not found" });

  try {
    const alert = scoreBorrower(borrower);
    const answer = await answerAnalystQuery(question, alert);
    res.json({ borrowerId: id, question, answer });
  } catch (err) {
    res.status(500).json({ error: "LLM service error", details: err.message });
  }
});

// Scenario simulation
router.post("/:id/simulate", requireRole("analyst"), (req, res) => {
  const { id } = req.params;
  const { scenario } = req.body;
  const validScenarios = ["next_emi_missed", "income_drop_50", "utilization_spike"];

  if (!validScenarios.includes(scenario)) {
    return res.status(400).json({ error: `Invalid scenario. Valid options: ${validScenarios.join(", ")}` });
  }

  const { users } = require("../data/mockData");
  const analystUser = users.find(u => u.id === req.user.id);
  if (!analystUser?.assignedBorrowers?.includes(id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const borrower = borrowers.find(b => b.id === id);
  if (!borrower) return res.status(404).json({ error: "Borrower not found" });

  res.json(simulateScenario(borrower, scenario));
});

module.exports = router;
