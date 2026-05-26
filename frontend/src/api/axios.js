import Axios from "axios";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000
});

export function setAuthToken(token) {
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete axios.defaults.headers.common.Authorization;
}

// Ensure authorization header is always attached from localStorage,
// even on first load before React context runs.
const LS_KEY = "nutritracker_auth_v1";

axios.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && !config.headers.Authorization) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

export default axios;

