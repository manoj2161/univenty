import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://univenty.onrender.com/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "univenty_token";

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Set, save or remove authentication token
export const setApiToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error("Token storage error:", error.message);
    throw error;
  }
};

// Attach authentication token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }

      console.log(
        "API Request:",
        config.method?.toUpperCase(),
        `${config.baseURL}${config.url}`,
      );
    } catch (error) {
      console.error("Token retrieval error:", error.message);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle API responses and network errors
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);

    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Server Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.code === "ECONNABORTED") {
      console.error("API Timeout: Server took too long to respond.");
    } else if (error.request) {
      console.error("Network Error:", {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
