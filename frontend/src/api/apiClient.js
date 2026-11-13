/**
 * Central API Client for Univenty
 * Ensures NO duplicate '/api' prefix ever occurs.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Clean trailing slashes and remove any trailing /api so we have strict domain root
export const SERVER_ROOT = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");
export const API_BASE_URL = `${SERVER_ROOT}/api`;

export const getAuthToken = () => {
  return localStorage.getItem("univenty_token");
};

/**
 * Universal JSON request helper
 * Automatically formats /api/... path correctly without duplication
 */
export async function apiRequest(endpoint, options = {}) {
  // Normalize endpoint: ensure it starts with / and does not start with /api if we append to API_BASE_URL
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If someone passed /api/events, strip the leading /api
  if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.substring(4);
  } else if (cleanEndpoint === "/api") {
    cleanEndpoint = "";
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Unexpected non-JSON response from ${url}: ${text.substring(0, 80)}`);
    }

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || "GET"} ${url}:`, err.message);
    throw err;
  }
}
