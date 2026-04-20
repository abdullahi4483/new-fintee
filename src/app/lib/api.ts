const DEFAULT_BASE_URL = "https://api-node-project-2xjc.onrender.com/api/v1";
const STORAGE_KEY = "fintech.session";
const SESSION_EVENT = "fintech:session-change";

export type AppRole = "client" | "admin";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  role: AppRole;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveSession(session: StoredSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(SESSION_EVENT));
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeToSessionChanges(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function buildUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const base = getBaseUrl().replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidates = [
    "message",
    "error",
    "detail",
    "title",
  ] as const;

  for (const key of candidates) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload;
}

let refreshPromise: Promise<StoredSession | null> | null = null;

async function refreshSession() {
  const session = loadSession();
  if (!session?.refreshToken) {
    saveSession(null);
    return null;
  }

  try {
    const payload = await apiRequest<unknown>("/auth/refresh", {
      method: "POST",
      auth: false,
      skipRefresh: true,
      body: { refreshToken: session.refreshToken },
    });

    const refreshed = normalizeSession(payload, session.role);
    saveSession(refreshed);
    return refreshed;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      saveSession(null);
      return null;
    }

    throw error;
  }
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    headers?: HeadersInit;
    skipRefresh?: boolean;
  } = {},
) {
  const session = loadSession();
  const headers = new Headers(options.headers);

  if (options.auth !== false && !session?.accessToken) {
    saveSession(null);
    throw new ApiError("Your session has expired. Please sign in again.", 401, null);
  }

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (
    response.status === 401 &&
    options.auth !== false &&
    !options.skipRefresh &&
    session?.refreshToken
  ) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });

    const refreshed = await refreshPromise;
    if (!refreshed?.accessToken) {
      saveSession(null);
      throw new ApiError("Your session has expired. Please sign in again.", 401, null);
    }

    return apiRequest<T>(path, {
      ...options,
      skipRefresh: true,
    });
  }

  return parseResponse(response) as Promise<T>;
}

export function unwrapData<T = unknown>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if ("data" in record) {
      return record.data as T;
    }
    if ("result" in record) {
      return record.result as T;
    }
    if ("payload" in record) {
      return record.payload as T;
    }
  }

  return payload as T;
}

export function pickObject<T extends Record<string, unknown>>(
  payload: unknown,
  preferredKeys: string[] = [],
) {
  const data = unwrapData<Record<string, unknown>>(payload);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {} as T;
  }

  for (const key of preferredKeys) {
    const value = data[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as T;
    }
  }

  return data as T;
}

export function pickArray<T>(payload: unknown, preferredKeys: string[] = []) {
  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) {
    return data as T[];
  }

  const candidates = [
    ...preferredKeys,
    "items",
    "results",
    "rows",
    "list",
    "users",
    "accounts",
    "transactions",
    "withdrawals",
    "messages",
    "cards",
  ];

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of candidates) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
  }

  return [];
}

export function toRole(value: unknown, fallback: AppRole = "client"): AppRole {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.toLowerCase().includes("admin") ? "admin" : "client";
}

export function normalizeSession(payload: unknown, fallbackRole: AppRole = "client"): StoredSession {
  const data = unwrapData<Record<string, unknown>>(payload);
  const user = pickObject<Record<string, unknown>>(payload, ["user", "profile"]);
  const firstName =
    typeof user?.firstName === "string"
      ? user.firstName
      : typeof data?.firstName === "string"
        ? data.firstName
        : "";
  const lastName =
    typeof user?.lastName === "string"
      ? user.lastName
      : typeof data?.lastName === "string"
        ? data.lastName
        : "";
  const fullName =
    typeof user?.fullName === "string"
      ? user.fullName
      : typeof user?.name === "string"
        ? user.name
        : [firstName, lastName].filter(Boolean).join(" ");

  const accessToken =
    typeof data?.accessToken === "string"
      ? data.accessToken
      : typeof data?.token === "string"
        ? data.token
        : "";
  const refreshToken =
    typeof data?.refreshToken === "string" ? data.refreshToken : "";
  const role = toRole(user?.role || data?.role, fallbackRole);

  return {
    accessToken,
    refreshToken,
    role,
    user: {
      id: typeof user?.id === "string" ? user.id : typeof user?._id === "string" ? user._id : undefined,
      fullName: fullName || undefined,
      email:
        typeof user?.email === "string"
          ? user.email
          : typeof data?.email === "string"
            ? data.email
            : undefined,
      phone:
        typeof user?.phone === "string"
          ? user.phone
          : typeof data?.phone === "string"
            ? data.phone
            : undefined,
      role:
        typeof user?.role === "string"
          ? user.role
          : typeof data?.role === "string"
            ? data.role
            : undefined,
    },
  };
}

export function formatApiDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function readNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}
