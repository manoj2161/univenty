import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setApiToken } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await api.get("/auth/me");
    const currentUser = response.data.user;

    setUser(currentUser);
    await AsyncStorage.setItem("univenty_user", JSON.stringify(currentUser));

    return currentUser;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("univenty_token");

        if (token) {
          await refreshUser();
        }
      } catch (error) {
        await setApiToken(null);
        await AsyncStorage.removeItem("univenty_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [refreshUser]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const { token, user: loggedInUser } = response.data;

    if (!token || !loggedInUser) {
      throw new Error("Invalid login response from server.");
    }

    await setApiToken(token);
    await AsyncStorage.setItem("univenty_user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    return response.data;
  };

  const logout = async () => {
    await setApiToken(null);
    await AsyncStorage.removeItem("univenty_user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.isAdmin === true || user?.category === "Admin",
    role: user?.category || "Guest",
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
