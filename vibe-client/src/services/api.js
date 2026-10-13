import axios from "axios";

const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;
const isDev = env && env.DEV;
let baseEnv = env && env.VITE_API_BASE_URL;

// If page is running over HTTPS (e.g. Vercel) and baseEnv is http://, force relative /api/v1
if (typeof window !== "undefined" && window.location.protocol === "https:") {
  if (!baseEnv || baseEnv.startsWith("http://")) {
    baseEnv = "/api/v1";
  }
}

const base = baseEnv || "/api/v1";



const api = axios.create({ baseURL: base, withCredentials: true });

api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  if (!config.headers.Authorization) {
    const token = localStorage.getItem("vibe_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
