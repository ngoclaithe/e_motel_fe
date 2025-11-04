type Maybe<T> = T | null;

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Common token locations: dedicated key or inside emotel_session object
    const explicit = localStorage.getItem("emotel_token") || localStorage.getItem("token");
    if (explicit) return explicit;

    const session = localStorage.getItem("emotel_session");
    if (session) {
      const obj = JSON.parse(session);
      if (obj && typeof obj === "object" && typeof obj.token === "string") return obj.token;
    }
  } catch {
    // ignore
  }
  return null;
}

async function request(path: string, init: RequestInit = {}): Promise<any> {
  const base = getBaseUrl();
  const url = path.match(/^https?:\/\//i) ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = getToken();

  const headers = new Headers(init.headers as HeadersInit);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Default content-type for non-GET requests with a body
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { credentials: "include", ...init, headers });

  if (!res.ok) {
    const text = await res.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {
      // keep raw text
    }
    const err: any = new Error(res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  request,
  get: (path: string, init?: RequestInit) => request(path, { ...(init || {}), method: "GET" }),
  post: (path: string, body?: unknown, init?: RequestInit) => request(path, { ...(init || {}), method: "POST", body: body && typeof body === "string" ? body : JSON.stringify(body) }),
  put: (path: string, body?: unknown, init?: RequestInit) => request(path, { ...(init || {}), method: "PUT", body: body && typeof body === "string" ? body : JSON.stringify(body) }),
  del: (path: string, init?: RequestInit) => request(path, { ...(init || {}), method: "DELETE", ...(init || {}) }),
};
