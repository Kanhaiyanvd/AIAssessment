import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

const DEMO_ACCOUNTS = [
  { label: "Analyst 1 (Ravi)", username: "analyst1", password: "pass123", role: "analyst" },
  { label: "Analyst 2 (Meena)", username: "analyst2", password: "pass123", role: "analyst" },
  { label: "Borrower (Rahul - Low Risk)", username: "rahul", password: "pass123", role: "borrower" },
  { label: "Borrower (Rohit - Critical)", username: "rohit", password: "pass123", role: "borrower" },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      if (data.borrowerId) localStorage.setItem("borrowerId", data.borrowerId);
      onLogin();
      navigate(data.role === "analyst" ? "/dashboard" : "/my-account");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(acc) {
    setUsername(acc.username);
    setPassword(acc.password);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏦</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 }}>LoanGuard AI</h1>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Early Warning System — Secure Login</p>
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="card">
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Demo Accounts (click to fill)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.username}
                onClick={() => quickLogin(acc)}
                className="btn-secondary"
                style={{ textAlign: "left", fontSize: 13, padding: "8px 12px" }}
              >
                <span style={{ fontWeight: 600 }}>{acc.role === "analyst" ? "👤" : "👨"}</span> {acc.label}
                <span style={{ float: "right", color: "#9ca3af", fontFamily: "monospace" }}>{acc.username} / {acc.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
