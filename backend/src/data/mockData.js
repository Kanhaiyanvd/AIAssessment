const borrowers = [
  {
    id: "B101",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    loanAmount: 500000,
    emiAmount: 12500,
    outstandingBalance: 410000,
    dueDates: ["2026-05-01", "2026-06-01"],
    paymentHistory: [
      { date: "2026-05-01", status: "paid", daysLate: 0, amount: 12500 },
      { date: "2026-04-01", status: "paid", daysLate: 2, amount: 12500 },
      { date: "2026-03-01", status: "paid", daysLate: 0, amount: 12500 },
    ],
    failedAutoDebits: 0,
    creditUtilization: 0.35,
    recentTransactions: [
      { date: "2026-05-28", type: "credit", amount: 55000, description: "Salary" },
      { date: "2026-05-15", type: "debit", amount: 8000, description: "Rent" },
      { date: "2026-05-10", type: "debit", amount: 3000, description: "Groceries" },
    ],
    avgMonthlyIncome: 55000,
    lastMonthIncome: 55000,
    assignedAnalyst: "analyst1"
  },
  {
    id: "B102",
    name: "Priya Mehta",
    email: "priya@example.com",
    loanAmount: 300000,
    emiAmount: 9000,
    outstandingBalance: 265000,
    dueDates: ["2026-05-10", "2026-06-10"],
    paymentHistory: [
      { date: "2026-05-10", status: "paid", daysLate: 5, amount: 9000 },
      { date: "2026-04-10", status: "paid", daysLate: 3, amount: 9000 },
      { date: "2026-03-10", status: "paid", daysLate: 0, amount: 9000 },
    ],
    failedAutoDebits: 1,
    creditUtilization: 0.62,
    recentTransactions: [
      { date: "2026-05-25", type: "credit", amount: 38000, description: "Salary" },
      { date: "2026-05-12", type: "debit", amount: 15000, description: "Loan Payment" },
      { date: "2026-05-05", type: "debit", amount: 6000, description: "Utilities" },
    ],
    avgMonthlyIncome: 45000,
    lastMonthIncome: 38000,
    assignedAnalyst: "analyst1"
  },
  {
    id: "B103",
    name: "Amit Patel",
    email: "amit@example.com",
    loanAmount: 800000,
    emiAmount: 22000,
    outstandingBalance: 720000,
    dueDates: ["2026-05-05", "2026-06-05"],
    paymentHistory: [
      { date: "2026-05-05", status: "missed", daysLate: 28, amount: 0 },
      { date: "2026-04-05", status: "partial", daysLate: 12, amount: 10000 },
      { date: "2026-03-05", status: "paid", daysLate: 7, amount: 22000 },
    ],
    failedAutoDebits: 3,
    creditUtilization: 0.85,
    recentTransactions: [
      { date: "2026-05-20", type: "debit", amount: 5000, description: "ATM Withdrawal" },
      { date: "2026-05-10", type: "debit", amount: 12000, description: "Shopping" },
      { date: "2026-04-25", type: "credit", amount: 20000, description: "Freelance" },
    ],
    avgMonthlyIncome: 70000,
    lastMonthIncome: 20000,
    assignedAnalyst: "analyst2"
  },
  {
    id: "B104",
    name: "Sneha Joshi",
    email: "sneha@example.com",
    loanAmount: 200000,
    emiAmount: 6500,
    outstandingBalance: 185000,
    dueDates: ["2026-05-20", "2026-06-20"],
    paymentHistory: [
      { date: "2026-05-20", status: "missed", daysLate: 14, amount: 0 },
      { date: "2026-04-20", status: "missed", daysLate: 20, amount: 0 },
      { date: "2026-03-20", status: "paid", daysLate: 8, amount: 6500 },
    ],
    failedAutoDebits: 4,
    creditUtilization: 0.91,
    recentTransactions: [
      { date: "2026-05-18", type: "debit", amount: 2000, description: "Food" },
      { date: "2026-05-10", type: "credit", amount: 15000, description: "Part-time work" },
      { date: "2026-04-28", type: "debit", amount: 8000, description: "Medical" },
    ],
    avgMonthlyIncome: 35000,
    lastMonthIncome: 15000,
    assignedAnalyst: "analyst2"
  },
  {
    id: "B105",
    name: "Vikram Singh",
    email: "vikram@example.com",
    loanAmount: 1200000,
    emiAmount: 35000,
    outstandingBalance: 1100000,
    dueDates: ["2026-05-15", "2026-06-15"],
    paymentHistory: [
      { date: "2026-05-15", status: "paid", daysLate: 1, amount: 35000 },
      { date: "2026-04-15", status: "paid", daysLate: 0, amount: 35000 },
      { date: "2026-03-15", status: "paid", daysLate: 0, amount: 35000 },
    ],
    failedAutoDebits: 0,
    creditUtilization: 0.28,
    recentTransactions: [
      { date: "2026-05-30", type: "credit", amount: 120000, description: "Salary" },
      { date: "2026-05-15", type: "debit", amount: 35000, description: "EMI" },
      { date: "2026-05-10", type: "debit", amount: 25000, description: "Business Expense" },
    ],
    avgMonthlyIncome: 120000,
    lastMonthIncome: 120000,
    assignedAnalyst: "analyst1"
  },
  {
    id: "B106",
    name: "Kavya Reddy",
    email: "kavya@example.com",
    loanAmount: 450000,
    emiAmount: 14000,
    outstandingBalance: 390000,
    dueDates: ["2026-05-25", "2026-06-25"],
    paymentHistory: [
      { date: "2026-05-25", status: "paid", daysLate: 9, amount: 14000 },
      { date: "2026-04-25", status: "paid", daysLate: 5, amount: 14000 },
      { date: "2026-03-25", status: "partial", daysLate: 0, amount: 8000 },
    ],
    failedAutoDebits: 2,
    creditUtilization: 0.72,
    recentTransactions: [
      { date: "2026-05-28", type: "credit", amount: 42000, description: "Salary" },
      { date: "2026-05-20", type: "debit", amount: 14000, description: "EMI" },
      { date: "2026-05-15", type: "debit", amount: 10000, description: "House Rent" },
    ],
    avgMonthlyIncome: 50000,
    lastMonthIncome: 42000,
    assignedAnalyst: "analyst2"
  },
  {
    id: "B107",
    name: "Rohit Kumar",
    email: "rohit@example.com",
    loanAmount: 600000,
    emiAmount: 18000,
    outstandingBalance: 570000,
    dueDates: ["2026-05-08", "2026-06-08"],
    paymentHistory: [
      { date: "2026-05-08", status: "missed", daysLate: 26, amount: 0 },
      { date: "2026-04-08", status: "missed", daysLate: 18, amount: 0 },
      { date: "2026-03-08", status: "missed", daysLate: 10, amount: 0 },
    ],
    failedAutoDebits: 5,
    creditUtilization: 0.95,
    recentTransactions: [
      { date: "2026-05-15", type: "credit", amount: 8000, description: "Miscellaneous" },
      { date: "2026-05-01", type: "debit", amount: 3000, description: "Groceries" },
    ],
    avgMonthlyIncome: 45000,
    lastMonthIncome: 8000,
    assignedAnalyst: "analyst1"
  },
  {
    id: "B108",
    name: "Ananya Das",
    email: "ananya@example.com",
    loanAmount: 350000,
    emiAmount: 10500,
    outstandingBalance: 280000,
    dueDates: ["2026-05-12", "2026-06-12"],
    paymentHistory: [
      { date: "2026-05-12", status: "paid", daysLate: 0, amount: 10500 },
      { date: "2026-04-12", status: "paid", daysLate: 0, amount: 10500 },
      { date: "2026-03-12", status: "paid", daysLate: 0, amount: 10500 },
    ],
    failedAutoDebits: 0,
    creditUtilization: 0.22,
    recentTransactions: [
      { date: "2026-05-28", type: "credit", amount: 65000, description: "Salary" },
      { date: "2026-05-12", type: "debit", amount: 10500, description: "EMI" },
      { date: "2026-05-05", type: "debit", amount: 12000, description: "Insurance" },
    ],
    avgMonthlyIncome: 65000,
    lastMonthIncome: 65000,
    assignedAnalyst: "analyst2"
  }
];

const users = [
  { id: "analyst1", username: "analyst1", password: "pass123", role: "analyst", name: "Ravi Analyst", assignedBorrowers: ["B101", "B102", "B105", "B107"] },
  { id: "analyst2", username: "analyst2", password: "pass123", role: "analyst", name: "Meena Analyst", assignedBorrowers: ["B103", "B104", "B106", "B108"] },
  { id: "B101", username: "rahul", password: "pass123", role: "borrower", borrowerId: "B101" },
  { id: "B103", username: "amit", password: "pass123", role: "borrower", borrowerId: "B103" },
  { id: "B104", username: "sneha", password: "pass123", role: "borrower", borrowerId: "B104" },
  { id: "B107", username: "rohit", password: "pass123", role: "borrower", borrowerId: "B107" },
];

module.exports = { borrowers, users };
