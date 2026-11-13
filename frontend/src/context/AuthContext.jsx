import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("univenty_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("univenty_token") || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem("univenty_token");
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("univenty_user", JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn("Session expired or invalid:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.token) {
      localStorage.setItem("univenty_token", data.token);
      localStorage.setItem("univenty_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (formData) => {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  };

  const logout = () => {
    localStorage.removeItem("univenty_token");
    localStorage.removeItem("univenty_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem("univenty_user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
        isAdmin: !!user && (user.isAdmin === true || user.category === "Admin"),
        isOrganiser: !!user && user.category === "Organiser",
        isStudent: !!user && user.category === "Student",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
