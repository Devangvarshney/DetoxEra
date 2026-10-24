import axios from "axios";

/**
 * Resolves the backend API base URL:
 * - Prioritizes NEXT_PUBLIC_API_URL (e.g. Render production URL)
 * - If running in a local desktop browser without an explicit URL, connects to http://localhost:8000
 */
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const isCapacitor = typeof (window as any).Capacitor !== "undefined" || hostname.includes("capacitor");
    
    // In local web browser development
    if (!isCapacitor && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return "http://localhost:8000";
    }
    if (!isCapacitor && hostname) {
      return `${protocol}//${hostname}:8000`;
    }
  }

  return "https://detoxera.onrender.com";
};

export const API_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Dynamic request interceptor: dynamically updates baseURL & attaches token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Helper to extract clean human-readable error messages from API or network errors.
 * Prevents React rendering crashes when FastAPI returns 422 validation arrays or nested objects.
 */
export function getApiErrorMessage(err: any, fallback = "An unexpected error occurred. Please try again."): string {
  if (!err) return fallback;

  // Network / Connection Error
  if (!err.response) {
    if (err.message && (err.message.includes("Network Error") || err.code === "ECONNABORTED")) {
      return "Unable to connect to the backend API. If the server is waking up from idle, please wait 30-45 seconds and try again.";
    }
    return err.message || fallback;
  }

  const detail = err.response.data?.detail;

  // FastAPI string error (e.g. HTTPException(status_code=400, detail="User already exists"))
  if (typeof detail === "string") {
    return detail;
  }

  // FastAPI Pydantic validation error array
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .filter(Boolean)
      .join("; ") || fallback;
  }

  // Nested object detail
  if (detail && typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }

  return err.response.data?.message || err.message || fallback;
}
