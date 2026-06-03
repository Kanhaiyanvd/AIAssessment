import { useEffect, useState } from "react";
import { getPortfolioSummary } from "../api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = { Critical: "#7c3aed", "High Risk": "#ef4444", Watchlist: "#f59e0b", Low: "#10b981" };

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPortfolioSummary()
      .then(setData)
      .catch(() => setError("Failed to load portfolio summary"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>Loading portfolio...</div>;
  if (error) return <div style={{ color: "#ef4444", padding: 24 }}>{error}</div>;

  const pieData = Object.entries(data.distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const barData = Object.entries(data.distribution).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Portfolio Risk Summary</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Aggregate view across all assigned borrowers</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Borrowers", value: data.totalBorrowers, color: "#3b82f6" },
          { label: "Avg Risk Score", value: `${data.averageRiskScore}/100`, color: "#f59e0b" },
          { label: "At-Risk Outstanding", value: `₹${(data.atRiskOutstandingBalance / 100000).toFixed(1)}L`, color: "#ef4444" },
          { label: "At-Risk %", value: `${data.atRiskPercentage}%`, color: "#7c3aed" },
        ].map(k => (
          <div key={k.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#374151" }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#374151" }}>Borrowers by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executive Summary */}
      {data.executiveSummary && (
        <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>AI Executive Summary</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap" }}>
            {typeof data.executiveSummary === "string" ? data.executiveSummary : JSON.stringify(data.executiveSummary, null, 2)}
          </p>
        </div>
      )}

      {/* Top Risk Borrowers */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#374151" }}>Top Risk Borrowers</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.topRiskBorrowers.map((b, i) => (
            <div key={b.borrowerId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#f9fafb", borderRadius: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#d1d5db", width: 24 }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{b.borrowerId}</div>
              </div>
              <span className={`badge badge-${b.category === "High Risk" ? "high" : b.category === "Critical" ? "critical" : b.category.toLowerCase()}`}>
                {b.category}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: COLORS[b.category] }}>{b.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
