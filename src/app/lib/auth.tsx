import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router";
import {
  apiRequest,
  AppRole,
  loadSession,
  normalizeSession,
  saveSession,
  StoredSession,
  subscribeToSessionChanges,
} from "./api";

interface AuthContextValue {
  session: StoredSession | null;
  isAuthenticated: boolean;
  login: (input: {
    email: string;
    password: string;
    roleHint?: AppRole;
  }) => Promise<StoredSession>;
  signup: (input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateSessionUser: (user: StoredSession["user"]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession());

  useEffect(() => subscribeToSessionChanges(() => setSession(loadSession())), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      async login({ email, password, roleHint = "client" }) {
        const payload = await apiRequest("/auth/login", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
        const nextSession = normalizeSession(payload, "client");

        if (roleHint === "admin" && nextSession.role !== "admin") {
          throw new Error("Admin login failed. This account is not an admin account.");
        }

        saveSession(nextSession);
        setSession(nextSession);
        return nextSession;
      },
      async signup({ fullName, email, phone, password }) {
        await apiRequest("/auth/signup", {
          method: "POST",
          auth: false,
          body: {
            email,
            password,
            fullName,
          },
        });
      },
      async logout() {
        saveSession(null);
        setSession(null);
      },
      updateSessionUser(user) {
        setSession((current) => {
          if (!current) {
            return current;
          }

          const next = { ...current, user };
          saveSession(next);
          return next;
        });
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function RequireAuth({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (session?.role !== role) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : session?.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, session } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={session?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}
