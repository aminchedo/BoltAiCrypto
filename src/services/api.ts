// src/services/api.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function normalizeBaseUrl(url: string) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getBaseUrl() {
  const env = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (env && env.trim()) return normalizeBaseUrl(env.trim());
  const origin = window.location.origin;
  return normalizeBaseUrl(origin);
}

async function request<T = unknown>(path: string, options: RequestInit = {}) {
  const base = getBaseUrl();
  const url = path.startsWith('/') ? base + path : base + '/' + path;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T = unknown>(path: string, init?: RequestInit) => request<T>(path, { method: 'GET', ...(init || {}) }),
  post: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...(init || {}) }),
  put: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...(init || {}) }),
  patch: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...(init || {}) }),
  delete: <T = unknown>(path: string, init?: RequestInit) => request<T>(path, { method: 'DELETE', ...(init || {}) }),
  baseUrl: getBaseUrl,

  // Extended methods for compatibility
  login: async (username: string, password: string) => {
    const response = await request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },

  getCurrentUser: () => request<any>('/auth/me'),
  
  getSettings: () => request<any>('/api/settings'),
};

// Export as apiService for backwards compatibility with existing components
export const apiService = api;
