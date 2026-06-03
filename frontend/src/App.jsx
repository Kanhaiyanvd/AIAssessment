import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BorrowerDetail from "./pages/BorrowerDetail";
import Portfolio from "./pages/Portfolio";
import BorrowerSelf from "./pages/BorrowerSelf";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [authKey, setAuthKey] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setAuthKey(k => k + 1)} />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar key={authKey} />
                <div style={{ flex: 1, padding: "24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
                  <Routes>
                    <Route path="/" element={
                      localStorage.getItem("role") === "analyst"
                        ? <Navigate to="/dashboard" replace />
                        : <Navigate to="/my-account" replace />
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute requiredRole="analyst"><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/borrowers/:id" element={
                      <ProtectedRoute requiredRole="analyst"><BorrowerDetail /></ProtectedRoute>
                    } />
                    <Route path="/portfolio" element={
                      <ProtectedRoute requiredRole="analyst"><Portfolio /></ProtectedRoute>
                    } />
                    <Route path="/my-account" element={
                      <ProtectedRoute requiredRole="borrower"><BorrowerSelf /></ProtectedRoute>
                    } />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
