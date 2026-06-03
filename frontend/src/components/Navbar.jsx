import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#3b82f6" : "#6b7280",
    textDecoration: "none",
    fontWeight: location.pathname === path ? 600 : 400,
    fontSize: 14,
    padding: "4px 8px",
    borderRadius: 6,
    background: location.pathname === path ? "#eff6ff" : "transparent",
  });

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#1e3a8a" }}>
          LoanGuard AI
        </span>
        {role === "analyst" && (
          <div style={{ display: "flex", gap: 4 }}>
            <Link to="/dashboard" style={linkStyle("/dashboard")}>Dashboard</Link>
            <Link to="/portfolio" style={linkStyle("/portfolio")}>Portfolio</Link>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {name} &bull; <span style={{ textTransform: "capitalize", color: role === "analyst" ? "#2563eb" : "#059669" }}>{role}</span>
        </span>
        <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
