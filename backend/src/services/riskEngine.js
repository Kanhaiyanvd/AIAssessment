/**
 * Risk Engine — rule-based heuristic scoring
 *
 * Scoring thresholds:
 *   0–24  → Low
 *   25–49 → Watchlist
 *   50–74 → High Risk
 *   75+   → Critical
 */

function calculateDPDTrend(paymentHistory) {
  if (!paymentHistory || paymentHistory.length < 2) return { score: 0, signals: [] };
  const signals = [];
  let score = 0;
  const recent = paymentHistory.slice(0, 3);

  const missedCount = recent.filter(p => p.status === "missed").length;
  const partialCount = recent.filter(p => p.status === "partial").length;
  const lateDays = recent.map(p => p.daysLate || 0);
  const avgLateDays = lateDays.reduce((a, b) => a + b, 0) / lateDays.length;

  if (missedCount >= 2) {
    score += 35;
    signals.push(`${missedCount} missed EMIs in last 3 months`);
  } else if (missedCount === 1) {
    score += 20;
    signals.push("1 missed EMI in last 3 months");
  }

  if (partialCount >= 1) {
    score += 10;
    signals.push(`${partialCount} partial payment(s) recorded`);
  }

  if (avgLateDays > 15) {
    score += 15;
    signals.push(`Average payment delay of ${Math.round(avgLateDays)} days`);
  } else if (avgLateDays > 7) {
    score += 8;
    signals.push(`Average payment delay of ${Math.round(avgLateDays)} days`);
  }

  const isWorsening = lateDays[0] >= lateDays[1] && lateDays[1] >= lateDays[2] && lateDays[0] > 5;
  if (isWorsening) {
    score += 10;
    signals.push("Payment delay trend is worsening month-over-month");
  }

  return { score, signals };
}

function calculateAutoDebitScore(failedAutoDebits) {
  const signals = [];
  let score = 0;
  if (failedAutoDebits >= 4) {
    score += 20;
    signals.push(`${failedAutoDebits} failed auto-debit attempts`);
  } else if (failedAutoDebits >= 2) {
    score += 12;
    signals.push(`${failedAutoDebits} failed auto-debit attempts`);
  } else if (failedAutoDebits === 1) {
    score += 5;
    signals.push("1 failed auto-debit attempt");
  }
  return { score, signals };
}

function calculateUtilizationScore(utilization) {
  const signals = [];
  let score = 0;
  const pct = Math.round(utilization * 100);
  if (utilization >= 0.90) {
    score += 20;
    signals.push(`Credit utilization critically high at ${pct}%`);
  } else if (utilization >= 0.75) {
    score += 12;
    signals.push(`Credit utilization elevated at ${pct}%`);
  } else if (utilization >= 0.60) {
    score += 6;
    signals.push(`Credit utilization above healthy threshold at ${pct}%`);
  }
  return { score, signals };
}

function calculateIncomeScore(avgIncome, lastIncome) {
  const signals = [];
  let score = 0;
  if (!avgIncome || avgIncome === 0) return { score: 10, signals: ["Insufficient income history"] };
  const dropRatio = (avgIncome - lastIncome) / avgIncome;
  if (dropRatio >= 0.60) {
    score += 20;
    signals.push(`Income dropped ${Math.round(dropRatio * 100)}% below average (avg: ₹${avgIncome.toLocaleString()}, last: ₹${lastIncome.toLocaleString()})`);
  } else if (dropRatio >= 0.30) {
    score += 12;
    signals.push(`Income declined ${Math.round(dropRatio * 100)}% below average`);
  } else if (dropRatio >= 0.15) {
    score += 5;
    signals.push(`Minor income decline of ${Math.round(dropRatio * 100)}%`);
  }
  return { score, signals };
}

function calculateBalanceScore(loanAmount, outstandingBalance, paymentHistory) {
  const signals = [];
  let score = 0;
  const repaidRatio = 1 - outstandingBalance / loanAmount;
  const missedCount = paymentHistory.filter(p => p.status === "missed").length;

  if (repaidRatio < 0.10 && missedCount > 0) {
    score += 10;
    signals.push("Very low repayment progress with missed payments");
  }
  return { score, signals };
}

function scoreToCategory(score) {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High Risk";
  if (score >= 25) return "Watchlist";
  return "Low";
}

function recommendActions(category, signals) {
  const actions = {
    Low: ["No immediate action required", "Continue standard monitoring"],
    Watchlist: ["Send soft payment reminder 5 days before due date", "Monitor next EMI closely"],
    "High Risk": ["Proactive call within 48 hours", "Offer flexible payment plan", "Escalate to credit team"],
    Critical: ["Immediate outreach required", "Initiate restructuring review", "Manual analyst review", "Consider legal escalation if no response in 7 days"]
  };
  return actions[category] || [];
}

function scoreBorrower(borrower) {
  const dpd = calculateDPDTrend(borrower.paymentHistory);
  const autoDebit = calculateAutoDebitScore(borrower.failedAutoDebits);
  const utilization = calculateUtilizationScore(borrower.creditUtilization);
  const income = calculateIncomeScore(borrower.avgMonthlyIncome, borrower.lastMonthIncome);
  const balance = calculateBalanceScore(borrower.loanAmount, borrower.outstandingBalance, borrower.paymentHistory);

  const totalScore = Math.min(100, dpd.score + autoDebit.score + utilization.score + income.score + balance.score);
  const category = scoreToCategory(totalScore);
  const allSignals = [...dpd.signals, ...autoDebit.signals, ...utilization.signals, ...income.signals, ...balance.signals];

  const severityMap = { Low: 1, Watchlist: 2, "High Risk": 3, Critical: 4 };

  return {
    borrowerId: borrower.id,
    borrowerName: borrower.name,
    riskScore: totalScore,
    riskCategory: category,
    severity: severityMap[category],
    signals: allSignals,
    actions: recommendActions(category, allSignals),
    scoreBreakdown: {
      dpdTrend: dpd.score,
      failedAutoDebits: autoDebit.score,
      creditUtilization: utilization.score,
      incomeDecline: income.score,
      balanceRisk: balance.score
    },
    loanAmount: borrower.loanAmount,
    emiAmount: borrower.emiAmount,
    outstandingBalance: borrower.outstandingBalance,
    creditUtilization: Math.round(borrower.creditUtilization * 100),
    failedAutoDebits: borrower.failedAutoDebits,
    paymentHistory: borrower.paymentHistory,
    recentTransactions: borrower.recentTransactions,
    assignedAnalyst: borrower.assignedAnalyst
  };
}

function simulateScenario(borrower, scenario) {
  const modified = JSON.parse(JSON.stringify(borrower));

  if (scenario === "next_emi_missed") {
    modified.paymentHistory.unshift({ date: new Date().toISOString().split("T")[0], status: "missed", daysLate: 30, amount: 0 });
    modified.failedAutoDebits += 1;
  } else if (scenario === "income_drop_50") {
    modified.lastMonthIncome = Math.round(modified.avgMonthlyIncome * 0.5);
  } else if (scenario === "utilization_spike") {
    modified.creditUtilization = Math.min(1, modified.creditUtilization + 0.2);
  }

  const base = scoreBorrower(borrower);
  const simulated = scoreBorrower(modified);

  return {
    scenario,
    baseline: { score: base.riskScore, category: base.riskCategory },
    projected: { score: simulated.riskScore, category: simulated.riskCategory },
    newSignals: simulated.signals.filter(s => !base.signals.includes(s)),
    additionalActions: simulated.actions.filter(a => !base.actions.includes(a))
  };
}

module.exports = { scoreBorrower, simulateScenario };
