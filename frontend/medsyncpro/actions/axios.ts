import axios from "axios";
import { config } from "@/lib/config";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// Track if we're currently refreshing
let isRefreshing = false;
let refreshPromise = null;

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and don't retry infinitely
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Token expired (client-side), attempting refresh...");

      // Prevent concurrent refresh requests
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = axios
          .post("/api/auth/refresh", null, {
            // Call Next.js API route which forwards to backend
            withCredentials: true,
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      try {
        await refreshPromise;
        originalRequest._retry = true;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Token refresh failed (client-side):", refreshError.message);

        // Clear session storage and redirect to login
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("medsyncpro_user");
          window.location.href = "/login";
        }

        return Promise.reject(new Error("Session expired. Please login again."));
      }
    }

    return Promise.reject(error);
  }
);

export default api;