function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const sanitize = (t: string) => t.replace(/^Bearer\s+/i, "").trim();
  try {
    const keys = ["emotel_token", "token", "access_token", "accessToken", "auth_token"];

    for (const storage of [localStorage, sessionStorage]) {
      try {
        for (const k of keys) {
          const v = storage.getItem(k);
          if (typeof v === "string" && v.trim()) return sanitize(v);
        }
        const session = storage.getItem("emotel_session");
        if (session) {
          const obj = JSON.parse(session) as unknown;
          if (
            obj &&
            typeof obj === "object" &&
            typeof (obj as Record<string, unknown>).token === "string"
          ) {
            return sanitize((obj as Record<string, unknown>).token as string);
          }
        }
      } catch {
      }
    }

    if (typeof document !== "undefined" && typeof document.cookie === "string" && document.cookie) {
      const cookieMap: Record<string, string> = {};
      document.cookie.split(";").forEach((entry) => {
        const idx = entry.indexOf("=");
        if (idx > -1) {
          const k = entry.slice(0, idx).trim();
          const v = decodeURIComponent(entry.slice(idx + 1));
          cookieMap[k] = v;
        }
      });
      for (const k of [...keys, "Authorization"]) {
        const v = cookieMap[k];
        if (typeof v === "string" && v.trim()) return sanitize(v);
      }
    }
  } catch {
  }
  return null;
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const base = getBaseUrl();
  const url = path.match(/^https?:\/\//i) ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = getToken();

  const headers = new Headers(init.headers as HeadersInit);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { credentials: "include", ...init, headers });

  if (!res.ok) {
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
    }
    const err = new Error(res.statusText || "Request failed") as Record<string, unknown> & Error;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (res.status === 204) return null as T;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
}

export const api = {
  request,
  get: <T = unknown>(path: string, init?: RequestInit) => 
    request<T>(path, { ...(init || {}), method: "GET" }),
  
  post: <T = unknown>(path: string, body?: unknown, init?: RequestInit) => 
    request<T>(path, { 
      ...(init || {}), 
      method: "POST", 
      body: body && typeof body === "string" ? body : JSON.stringify(body) 
    }),
  
  put: <T = unknown>(path: string, body?: unknown, init?: RequestInit) => 
    request<T>(path, { 
      ...(init || {}), 
      method: "PUT", 
      body: body && typeof body === "string" ? body : JSON.stringify(body) 
    }),
  
  del: <T = unknown>(path: string, init?: RequestInit) => 
    request<T>(path, { ...(init || {}), method: "DELETE" }),
};