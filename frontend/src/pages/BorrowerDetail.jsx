import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBorrower, explainBorrower, queryBorrower, simulateBorrower } from "../api";
import RiskBadge from "../components/RiskBadge";

const SCENARIOS = [
  { key: "next_emi_missed", label: "Next EMI Missed" },
  { key: "income_drop_50", label: "Income Drops 50%" },
  { key: "utilization_spike", label: "Credit Utilization Spikes +20%" },
];

const STATUS_COLOR = { paid: "#10b981", missed: "#ef4444", partial: "#f59e0b" };

export default function BorrowerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBorrower(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  async function handleExplain() {
    setLoadingExplain(true);
    try { setExplanation(await explainBorrower(id)); }
    catch { setExplanation({ explanation: "Failed to generate explanation." }); }
    finally { setLoadingExplain(false); }
  }

  async function handleQuery(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoadingQuery(true);
    try { setAnswer(await queryBorrower(id, question)); }
    catch { setAnswer({ answer: "Failed to get answer." }); }
    finally { setLoadingQuery(false); }
  }

  async function handleSimulate(scenario) {
    setLoadingSim(true);
    setActiveScenario(scenario);
    try { setSimResult(await simulateBorrower(id, scenario)); }
    catch { setSimResult(null); }
    finally { setLoadingSim(false); }
  }

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 24, color: "#ef4444" }}>Borrower not found</div>;

  const riskColor = { Low: "#10b981", Watchlist: "#f59e0b", "High Risk": "#ef4444", Critical: "#7c3aed" }[data.riskCategory];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate("/dashboard")} style={{ marginBottom: 12, fontSize: 13 }}>
            ← Back to Dashboard
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{data.borrowerName}
            <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>({data.borrowerId})</span>
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RiskBadge category={data.riskCategory} />
          <span style={{ fontSize: 22, fontWeight: 700, color: riskColor }}>{data.riskScore}</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>/100</span>
        </div>
      </div>

      {/* Loan Overview + Score Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#374151" }}>Loan Overview</h3>
          {[
            ["Loan Amount", `₹${data.loanAmount?.toLocaleString()}`],
            ["EMI Amount", `₹${data.emiAmount?.toLocaleString()}`],
            ["Outstanding Balance", `₹${data.outstandingBalance?.toLocaleString()}`],
            ["Credit Utilization", `${data.creditUtilization}%`],
            ["Failed Auto-Debits", data.failedAutoDebits],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: "#6b7280" }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#374151" }}>Score Breakdown</h3>
          {data.scoreBreakdown && Object.entries(data.scoreBreakdown).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: "#6b7280", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</span>
                <span style={{ fontWeight: 600, color: v > 0 ? "#ef4444" : "#10b981" }}>{v}</span>
              </div>
              <div style={{ width: "100%", height: 5, background: "#f3f4f6", borderRadius: 3 }}>
                <div style={{ width: `${Math.min(v * 2, 100)}%`, height: "100%", background: v > 15 ? "#ef4444" : v > 5 ? "#f59e0b" : "#10b981", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Signals */}
      {data.signals?.length > 0 && (
        <div className="card" style={{ borderLeft: `4px solid ${riskColor}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>Risk Signals Detected</h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {data.signals.map((s, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14 }}>
                <span style={{ color: riskColor, marginTop: 1 }}>⚠</span>
                <span style={{ color: "#374151" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {data.actions?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>Recommended Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.actions.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}>
                <span style={{ color: "#059669" }}>→</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>Payment History</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.paymentHistory?.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f9fafb", borderRadius: 8, fontSize: 14 }}>
              <span style={{ color: "#374151" }}>{p.date}</span>
              <span style={{ color: STATUS_COLOR[p.status] || "#6b7280", fontWeight: 600, textTransform: "capitalize" }}>{p.status}</span>
              <span style={{ color: "#6b7280" }}>₹{p.amount?.toLocaleString()}</span>
              {p.daysLate > 0 && <span style={{ color: "#ef4444", fontSize: 12 }}>{p.daysLate}d late</span>}
            </div>
          ))}
        </div>
      </div>

      {/* LLM Explanation */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>AI Risk Explanation</h3>
          <button className="btn-primary" onClick={handleExplain} disabled={loadingExplain} style={{ fontSize: 13 }}>
            {loadingExplain ? "Generating..." : "Generate Explanation"}
          </button>
        </div>
        {explanation && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 16, fontSize: 14, lineHeight: 1.7, color: "#1e3a8a", whiteSpace: "pre-wrap" }}>
            {typeof explanation.explanation === "string" ? explanation.explanation : JSON.stringify(explanation.explanation, null, 2)}
          </div>
        )}
      </div>

      {/* Analyst Query */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>Ask About This Borrower</h3>
        <form onSubmit={handleQuery} style={{ display: "flex", gap: 8 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder='e.g. "Why was this borrower flagged?" or "What is the main risk factor?"'
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={loadingQuery} style={{ whiteSpace: "nowrap" }}>
            {loadingQuery ? "..." : "Ask"}
          </button>
        </form>
        {answer && (
          <div style={{ marginTop: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Q: {answer.question}</div>
            {typeof answer.answer === "string" ? answer.answer : JSON.stringify(answer.answer, null, 2)}
          </div>
        )}
      </div>

      {/* Scenario Simulation */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Scenario Simulation</h3>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>Simulate what-if scenarios and see projected risk impact</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {SCENARIOS.map(s => (
            <button
              key={s.key}
              onClick={() => handleSimulate(s.key)}
              disabled={loadingSim}
              className="btn-secondary"
              style={{ fontSize: 13 }}
            >
              {loadingSim && activeScenario === s.key ? "Simulating..." : s.label}
            </button>
          ))}
        </div>
        {simResult && (
          <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#92400e" }}>
              Scenario: {SCENARIOS.find(s => s.key === simResult.scenario)?.label}
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Current</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#374151" }}>{simResult.baseline.score} — {simResult.baseline.category}</div>
              </div>
              <div style={{ fontSize: 20, color: "#9ca3af", alignSelf: "center" }}>→</div>
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Projected</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#ef4444" }}>{simResult.projected.score} — {simResult.projected.category}</div>
              </div>
            </div>
            {simResult.newSignals?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>New risk signals:</div>
                {simResult.newSignals.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#92400e" }}>• {s}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
