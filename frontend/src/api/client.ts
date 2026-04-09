//This is the JWT fetch wrapper handling all protected calls

const BASE_URL = 'https://resumereaper.com/api';

//Types
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

//Token helperes

export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string): void => localStorage.setItem('token', token);
export const clearToken = (): void => localStorage.removeItem('token');

//Base fetch with JWT header

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

//Auth endpoints

export const login = (email: string, password: string): Promise<LoginResponse> =>
  apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> =>
  apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, username, email, password }),
  });

export const verifyEmail = (token: string): Promise<{ message: string }> =>
  apiFetch<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
