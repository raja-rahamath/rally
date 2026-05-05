const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function api<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; meta?: any; errors?: any[] }> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API error: ${res.status}`);
  }

  return json;
}

export const apiGet = <T = any>(endpoint: string) => api<T>(endpoint);

export const apiPost = <T = any>(endpoint: string, body: any) =>
  api<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = <T = any>(endpoint: string, body: any) =>
  api<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
