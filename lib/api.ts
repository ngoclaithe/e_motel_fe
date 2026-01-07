function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const base = getBaseUrl();
  const url = path.match(/^https?:\/\//i) ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers as HeadersInit);

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

  patch: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...(init || {}),
      method: "PATCH",
      body: body && typeof body === "string" ? body : JSON.stringify(body)
    }),

  del: <T = unknown>(path: string, init?: RequestInit) =>
    request<T>(path, { ...(init || {}), method: "DELETE" }),

  downloadBlob: async (path: string, filename: string): Promise<void> => {
    const base = getBaseUrl();
    const url = path.match(/^https?:\/\//i) ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

    const res = await fetch(url, { credentials: "include" });

    if (!res.ok) {
      throw new Error(`Failed to download: ${res.statusText}`);
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  },
};