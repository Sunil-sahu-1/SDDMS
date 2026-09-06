const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api").replace(/\/$/, "");

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sddms_access_token");
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  body: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.body = data;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, skipAuth = false): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !skipAuth) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sddms_access_token");
      localStorage.removeItem("sddms_user");
    }
    const body = data as { detail?: string; message?: string; error?: string } | null;
    throw new ApiError(body?.detail ?? body?.message ?? body?.error ?? `Request failed (${response.status})`, response.status, data);
  }

  return data as T;
}

export async function apiDownload(path: string): Promise<Response> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sddms_access_token");
      localStorage.removeItem("sddms_user");
    }
    throw new ApiError(data?.detail ?? data?.message ?? `Download failed (${response.status})`, response.status, data);
  }
  return response;
}

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    apiRequest<{ access?: string; accessToken?: string; refresh?: string; refreshToken?: string }>(
      "/accounts/login/", { method: "POST", body: JSON.stringify(payload) }, true),
  register: (payload: Record<string, unknown>) =>
    apiRequest("/accounts/register/", { method: "POST", body: JSON.stringify(payload) }, true),
  registerApplication: (data: FormData) =>
    apiRequest("/accounts/register/", { method: "POST", body: data }, true),
  me: () => apiRequest<{ success?: boolean; data?: Record<string, unknown> }>("/accounts/me/"),
  verify: (payload: Record<string, unknown>) =>
    apiRequest("/accounts/verification/", { method: "POST", body: JSON.stringify(payload) }),
};

const crud = (resource: string) => ({
  list: (query = "") => apiRequest(`${resource}/${query ? `?${query}` : ""}`),
  get: (id: string | number) => apiRequest(`${resource}/${id}/`),
  create: (payload: unknown) => apiRequest(`${resource}/`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string | number, payload: unknown) => apiRequest(`${resource}/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest(`${resource}/${id}/`, { method: "DELETE" }),
});

export const casesApi = {
  ...crud("/cases"),
  history: (id: string | number) => apiRequest(`/cases/${id}/history/`),
  updateStatus: (id: string | number, status: string, comment = "") =>
    apiRequest(`/cases/${id}/update-status/`, { method: "POST", body: JSON.stringify({ status, comment }) }),
};

export const complaintsApi = crud("/complaints");

export const evidenceApi = {
  ...crud("/evidence"),
  upload: (data: FormData) => apiRequest("/evidence/", { method: "POST", body: data }),
  download: (id: string | number) => apiDownload(`/evidence/${id}/download/`),
  verify: (id: string | number) => apiRequest(`/evidence/${id}/verify-integrity/`),
  custodyHistory: (id: string | number) => apiRequest(`/evidence/${id}/custody-history/`),
  activity: (id: string | number) => apiRequest(`/evidence/${id}/activity/`),
};

export const documentsApi = {
  ...crud("/documents"),
  upload: (data: FormData) => apiRequest("/documents/", { method: "POST", body: data }),
  download: (id: string | number) => apiRequest(`/documents/${id}/download/`),
  versions: (id: string | number) => apiRequest(`/documents/${id}/versions/`),
  verify: (id: string | number) => apiRequest(`/documents/${id}/verify-integrity/`),
  newVersion: (id: string | number, data: FormData) => apiRequest(`/documents/${id}/new-version/`, { method: "POST", body: data }),
};

export const investigationsApi = crud("/investigations/witness-statements");

export const legalApi = {
  reviews: crud("/legal/reviews"),
  hearings: crud("/legal/hearings"),
  approveReview: (id: string | number) => apiRequest(`/legal/reviews/${id}/approve/`, { method: "POST" }),
  rejectReview: (id: string | number, reason?: string) => apiRequest(`/legal/reviews/${id}/reject/`, { method: "POST", body: JSON.stringify({ rejection_reason: reason }) }),
  completeHearing: (id: string | number) => apiRequest(`/legal/hearings/${id}/complete/`, { method: "POST" }),
};

export const auditApi = {
  list: (query = "") => apiRequest(`/audit/logs/${query ? `?${query}` : ""}`),
};

export const dashboardApi = {
  get: () => apiRequest("/admin/dashboard/"),
};

export const adminApi = {
  dashboard: () => apiRequest("/admin/dashboard/"),
  users: () => apiRequest<{ success?: boolean; count?: number; data?: Record<string, unknown>[] }>("/accounts/users/"),
  user: (id: string | number) => apiRequest<{ success?: boolean; data?: Record<string, unknown> }>(`/accounts/users/${id}/`),
  updateUser: (id: string | number, payload: Record<string, unknown>) => apiRequest<{ data?: Record<string, unknown> }>(`/accounts/users/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  setRole: (id: string | number, role: string) => apiRequest<{ data?: Record<string, unknown> }>(`/accounts/users/${id}/role/`, { method: "PATCH", body: JSON.stringify({ role }) }),
  setStatus: (id: string | number, is_active: boolean) => apiRequest<{ data?: Record<string, unknown> }>(`/accounts/users/${id}/status/`, { method: "PATCH", body: JSON.stringify({ is_active }) }),
  deleteUser: (id: string | number) => apiRequest(`/accounts/users/${id}/`, { method: "DELETE" }),
  verifications: () => apiRequest<{ success?: boolean; count?: number; data?: Record<string, unknown>[] }>("/accounts/verifications/"),
  approveVerification: (id: string | number) => apiRequest(`/accounts/verifications/${id}/approve/`, { method: "POST" }),
  rejectVerification: (id: string | number, reason: string) => apiRequest(`/accounts/verifications/${id}/reject/`, { method: "POST", body: JSON.stringify({ rejection_reason: reason }) }),
};

export const searchApi = {
  global: (q: string) => apiRequest(`/search/?q=${encodeURIComponent(q)}`),
};

export const aiApi = {
  analyzeDocument: (id: string | number) => apiRequest(`/ai/documents/${id}/analyze/`, { method: "POST" }),
  summarizeDocument: (id: string | number) => apiRequest(`/ai/documents/${id}/summarize/`, { method: "POST" }),
  documentAnalysis: (id: string | number) => apiRequest(`/ai/documents/${id}/analysis/`),
  search: (query: string) => apiRequest(`/ai/search/?q=${encodeURIComponent(query)}`),
};
