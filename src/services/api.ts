import { AnalysisResult, AuthResponse, Language, SystemStats, User } from '../types';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('verifact_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Authentication
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  // Analysis
  analyzeText: async (text: string, language: Language = 'en'): Promise<AnalysisResult> => {
    const res = await fetch('/api/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ text, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze text claim');
    return data;
  },

  analyzeUrl: async (url: string, language: Language = 'en'): Promise<AnalysisResult> => {
    const res = await fetch('/api/analyze/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ url, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze URL');
    return data;
  },

  extractOcr: async (imageBase64: string, mimeType: string = 'image/png'): Promise<string> => {
    const res = await fetch('/api/analyze/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to extract text from image');
    return data.extractedText;
  },

  analyzeImage: async (
    imageBase64: string,
    mimeType: string,
    userEditedText?: string,
    language: Language = 'en'
  ): Promise<AnalysisResult> => {
    const res = await fetch('/api/analyze/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ imageBase64, mimeType, userEditedText, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze image claim');
    return data;
  },

  // History & Analyses
  getAnalyses: async (): Promise<AnalysisResult[]> => {
    const res = await fetch('/api/analyses', {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
    return data;
  },

  getHistory: async (): Promise<AnalysisResult[]> => {
    return api.getAnalyses();
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    const res = await fetch(`/api/analyses/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete record');
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    return api.deleteAnalysis(id);
  },

  clearHistory: async (): Promise<void> => {
    const items = await api.getAnalyses();
    for (const item of items) {
      try {
        await api.deleteAnalysis(item.id);
      } catch (err) {
        // ignore individual delete fails
      }
    }
  },

  // Profile
  updateProfile: async (
    updates: Partial<{ name: string; preferredLanguage: Language; theme: 'dark' | 'light' }>
  ): Promise<User> => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const res = await fetch('/api/profile/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
  },

  // Admin
  getAdminStats: async (): Promise<SystemStats> => {
    const res = await fetch('/api/admin/stats', {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data;
  },

  getAdminUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/admin/users', {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data;
  },

  getAdminAnalyses: async (): Promise<AnalysisResult[]> => {
    const res = await fetch('/api/admin/analyses', {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch all analyses');
    return data;
  },

  deleteAdminUser: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
  },

  deleteAdminAnalysis: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/analyses/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete analysis');
  },
};
