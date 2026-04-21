//This is the JWT fetch wrapper handling all protected calls

export const BASE_URL = 'https://resumereaper.com/api';

//Types
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
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

export interface ResumeVersion {
  _id: string;
  resumeId: string;
  versionNumber: number;
  commitMessage: string;
  s3Key?: string;
  originalFileName?: string;
  thumbnailS3Key?: string;
  thumbnailUrl?: string;
  keywords: string[];
  parentVersionId?: string | null;
  source: 'upload' | 'ai_edit' | 'manual_edit';
  createdAt: string;
}

export interface Resume {
  _id: string;
  title: string;
  headVersionId?: string;
  headVersion?: ResumeVersion;
  createdAt: string;
  thumbnailUrl?: string; // flattened from headVersion by the API
}

export interface Application {
  _id: string;
  resumeId: string;
  resumeVersionId?: string;
  companyName: string;
  jobTitle: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted';
  dateApplied?: string;
  jobLink?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

//Token helpers

export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string): void => localStorage.setItem('token', token);
export const clearToken = (): void => localStorage.removeItem('token');

//User helpers

export const getUser = (): AuthUser | null => {
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};
export const setUser = (user: AuthUser): void => localStorage.setItem('user', JSON.stringify(user));
export const clearUser = (): void => localStorage.removeItem('user');

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
  email: string,
  password: string
): Promise<RegisterResponse> =>
  apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

export const verifyEmail = (token: string): Promise<{ message: string }> =>
  apiFetch<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);

export const forgotPassword = (email: string): Promise<{ message: string }> =>
  apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token: string, password: string): Promise<{ message: string }> =>
  apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });

//Resume endpoints

export const listResumes = (): Promise<{ resumes: Resume[] }> =>
  apiFetch<{ resumes: Resume[] }>('/resumes');

export const uploadResume = async (file: File, title: string): Promise<{ resume: Resume }> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('title', title);

  const res = await fetch(`${BASE_URL}/resumes/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Upload failed');
  return data;
};

export const deleteResume = (id: string): Promise<{ message: string }> =>
  apiFetch<{ message: string }>(`/resumes/${id}`, { method: 'DELETE' });

export const searchResumes = (q: string): Promise<{ resumes: Resume[] }> =>
  apiFetch<{ resumes: Resume[] }>(`/resumes/search?q=${encodeURIComponent(q)}`);

export const getResumePdfUrl = (id: string): string => `${BASE_URL}/resumes/${id}/pdf`;

export const getResume = (id: string): Promise<{ resume: Resume; versions: ResumeVersion[]; downloadUrl: string }> =>
  apiFetch<{ resume: Resume; versions: ResumeVersion[]; downloadUrl: string }>(`/resumes/${id}`);

export const createResumeVersion = (
  resumeId: string,
  data: { commitMessage: string; extractedText?: string; source: 'ai_edit' | 'manual_edit' }
): Promise<{ version: ResumeVersion }> =>
  apiFetch<{ version: ResumeVersion }>(`/resumes/${resumeId}/versions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

//Application endpoints

export const listApplications = (resumeId?: string): Promise<{ applications: Application[] }> =>
  apiFetch<{ applications: Application[] }>(
    `/applications${resumeId ? `?resumeId=${encodeURIComponent(resumeId)}` : ''}`
  );

export const createApplication = (data: {
  resumeId: string;
  companyName: string;
  jobTitle: string;
  status?: string;
  jobLink?: string;
  location?: string;
  notes?: string;
  dateApplied?: string;
}): Promise<{ application: Application }> =>
  apiFetch<{ application: Application }>('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateApplication = (
  id: string,
  updates: Partial<Pick<Application, 'companyName' | 'jobTitle' | 'status' | 'jobLink' | 'location' | 'notes' | 'dateApplied'>>
): Promise<{ application: Application }> =>
  apiFetch<{ application: Application }>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const deleteApplication = (id: string): Promise<{ message: string }> =>
  apiFetch<{ message: string }>(`/applications/${id}`, { method: 'DELETE' });

//AI review endpoint — streams plain text chunks via onChunk callback
export interface ReviewParams {
  resumeId: string;
  mode: 'tailoring' | 'review';
  company?: string;
  position?: string;
  jobDescription?: string;
  targetJob?: string;
  additionalContext?: string;
}

export const reviewResume = async (
  params: ReviewParams,
  onChunk: (text: string) => void
): Promise<void> => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/ai/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Review failed');
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
};
