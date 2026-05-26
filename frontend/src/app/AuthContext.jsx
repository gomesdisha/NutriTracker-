import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios, { setAuthToken } from "../api/axios.js";

const AuthContext = createContext(null);

const LS_KEY = "nutritracker_auth_v1";

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  });

  useEffect(() => {
    setAuthToken(state.token);
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  async function login(email, password) {
    const { data } = await axios.post("/auth/login", { email, password });
    // Set header immediately so first dashboard API calls are authenticated
    setAuthToken(data.accessToken);
    setState({ token: data.accessToken, user: data.user });
    return data.user;
  }

  function logout() {
    setState({ token: null, user: null });
  }

  const value = useMemo(
    () => ({
      token: state.token,
      user: state.user,
      isAuthed: Boolean(state.token && state.user),
      login,
      logout
    }),
    [state.token, state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

