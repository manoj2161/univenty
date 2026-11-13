import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Android emulator: 10.0.2.2
// Physical phone: use your computer's local IPv4 address.
// Example: http://192.168.1.5:5000/api
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("univenty_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to the server.";

    return Promise.reject(new Error(message));
  },
);

export const setApiToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem("univenty_token", token);
  } else {
    await AsyncStorage.removeItem("univenty_token");
  }
};

export default api;
