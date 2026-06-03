import { useEffect, useState } from "react";
import { getBorrower } from "../api";
import RiskBadge from "../components/RiskBadge";

const STATUS_COLOR = { paid: "#10b981", missed: "#ef4444", partial: "#f59e0b" };

export default function BorrowerSelf() {
  const borrowerId = localStorage.getItem("borrowerId");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!borrowerId) { setError("No borrower account linked"); setLoading(false); return; }
    getBorrower(borrowerId)
      .then(setData)
      .catch(() => setError("Failed to load your account data"))
      .finally(() => setLoading(false));
  }, [borrowerId]);

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>Loading your account...</div>;
  if (error) return <div style={{ color: "#ef4444", padding: 24 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>My Account</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Your loan risk status — {borrowerId}</p>
      </div>

      <div className="card" style={{ textAlign: "center", padding: 28 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Your Risk Status</div>
        <RiskBadge category={data.riskCategory} />
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 16, lineHeight: 1.6 }}>
          {data.riskCategory === "Low"
            ? "Your account is in good standing. Keep up the timely payments!"
            : data.riskCategory === "Watchlist"
            ? "Your account needs attention. Please ensure your next EMI is paid on time."
            : "Your account requires immediate attention. Please contact your lender."}
        </p>
      </div>

      {data.signals?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Why you were flagged</h3>
          {data.signals.map((s, i) => (
            <div key={i} style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>⚠ {s}</div>
          ))}
        </div>
      )}

      {data.actions?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recommended Steps</h3>
          {data.actions.map((a, i) => (
            <div key={i} style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>→ {a}</div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Payment History</h3>
        {data.paymentHistory?.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14 }}>
            <span style={{ color: "#6b7280" }}>{p.date}</span>
            <span style={{ color: STATUS_COLOR[p.status] || "#374151", fontWeight: 600, textTransform: "capitalize" }}>{p.status}</span>
            <span>₹{p.amount?.toLocaleString()}</span>
            {p.daysLate > 0 && <span style={{ color: "#ef4444", fontSize: 12 }}>{p.daysLate}d late</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
