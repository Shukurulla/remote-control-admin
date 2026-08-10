import type {
  AiCommentResponse,
  AiLang,
  AiTone,
  CommandName,
  CommandParams,
  CommandRecord,
  Device,
  LoginResponse,
  VerifyResponse,
} from "./types";

// Bo'sh bo'lsa nisbiy yo'llar ishlatiladi (next.config rewrites orqali proxy).
const BASE = process.env.NEXT_PUBLIC_API_URL || "";

const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Server bilan aloqa yo'q", 0);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Xatolik yuz berdi (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  verify: () => request<VerifyResponse>("/api/auth/verify"),
};

// ── Devices ─────────────────────────────────────────────────
export const devicesApi = {
  list: () => request<Device[]>("/api/devices"),
};

// ── Commands ────────────────────────────────────────────────
export const commandsApi = {
  send: (deviceId: string, command: CommandName, params: CommandParams) =>
    request<{ success?: boolean; command?: unknown }>("/api/commands/send", {
      method: "POST",
      body: JSON.stringify({ deviceId, command, params }),
    }),

  aiComment: (payload: {
    postUrl: string;
    postDescription: string;
    tone: AiTone;
    lang: AiLang;
    deviceIds: string[];
  }) =>
    request<AiCommentResponse>("/api/commands/ai-comment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  history: (deviceId: string) =>
    request<CommandRecord[]>(
      `/api/commands/history/${encodeURIComponent(deviceId)}`,
    ),
};

/** Socket.io ulanish manzili (bo'sh bo'lsa same-origin) */
export function socketUrl(): string {
  return BASE || (typeof window !== "undefined" ? window.location.origin : "");
}
