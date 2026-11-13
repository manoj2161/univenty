import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        color: "var(--accent)",
      }}>
        Verifying administrative privileges...
      </div>
    );
  }

  // Strict Admin verification
  const isActualAdmin = isAuthenticated && user && (user.category === "Admin" || user.isAdmin === true);

  if (!isActualAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
