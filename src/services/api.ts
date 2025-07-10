const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('shuttleup_token');
  return token;
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('shuttleup_token', response.token);
    }
    
    return response;
  },

  register: async (userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    division: number;
    password: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem('shuttleup_token');
  },
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  
  update: (id: string, userData: any) => 
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
    
  addCredits: (id: string, amount: number) =>
    apiRequest(`/users/${id}/credits`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
    
  getCreditHistory: (id: string) => 
    apiRequest(`/users/${id}/credit-history`),
};

// Sessions API
export const sessionsAPI = {
  getAll: () => apiRequest('/sessions'),
  
  create: (sessionData: any) =>
    apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),
    
  book: (id: string) =>
    apiRequest(`/sessions/${id}/book`, {
      method: 'POST',
    }),
    
  cancelBooking: (id: string) =>
    apiRequest(`/sessions/${id}/book`, {
      method: 'DELETE',
    }),
};