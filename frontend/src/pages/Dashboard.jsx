import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBorrowers } from "../api";
import RiskBadge from "../components/RiskBadge";

const SEVERITY_COLOR = { Low: "#10b981", Watchlist: "#f59e0b", "High Risk": "#ef4444", Critical: "#7c3aed" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getBorrowers()
      .then(setData)
      .catch(() => setError("Failed to load borrowers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Loading borrowers...</div>;
  if (error) return <div style={{ color: "#ef4444", padding: 24 }}>{error}</div>;

  const categories = ["All", "Critical", "High Risk", "Watchlist", "Low"];
  const filtered = filter === "All" ? data.borrowers : data.borrowers.filter(b => b.riskCategory === filter);

  const counts = data.borrowers.reduce((acc, b) => {
    acc[b.riskCategory] = (acc[b.riskCategory] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Borrower Risk Dashboard</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
          {data.total} assigned borrowers · sorted by risk severity
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {["Critical", "High Risk", "Watchlist", "Low"].map(cat => (
          <div key={cat} className="card" style={{ borderLeft: `4px solid ${SEVERITY_COLOR[cat]}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: SEVERITY_COLOR[cat] }}>{counts[cat] || 0}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{cat}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              background: filter === cat ? "#1e3a8a" : "#e5e7eb",
              color: filter === cat ? "#fff" : "#374151",
              border: "none",
              cursor: "pointer",
              fontWeight: filter === cat ? 600 : 400,
            }}
          >
            {cat} {cat !== "All" && `(${counts[cat] || 0})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Borrower ID", "Name", "Risk Level", "Score", "Top Signals", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr
                key={b.borrowerId}
                onClick={() => navigate(`/borrowers/${b.borrowerId}`)}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", fontSize: 13, fontFamily: "monospace", color: "#6b7280" }}>{b.borrowerId}</td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500 }}>{b.borrowerName}</td>
                <td style={{ padding: "14px 16px" }}><RiskBadge category={b.riskCategory} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 48, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${b.riskScore}%`, height: "100%", background: SEVERITY_COLOR[b.riskCategory], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{b.riskScore}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280", maxWidth: 220 }}>
                  {b.topSignals.slice(0, 1).map((s, i) => <div key={i} style={{ marginBottom: 2 }}>• {s}</div>)}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>
                  {b.actions.slice(0, 1).map((a, i) => <div key={i}>→ {a}</div>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No borrowers in this category</div>
        )}
      </div>
    </div>
  );
}
