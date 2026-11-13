import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
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
        Loading access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.category)) {
      // Role redirection
      if (user?.category === "Admin") return <Navigate to="/admin/dashboard" replace />;
      if (user?.category === "Organiser") return <Navigate to="/organiser/dashboard" replace />;
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
}
