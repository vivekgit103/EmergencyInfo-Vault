/**
 * Centralized API Client for EmergencyInfo Vault
 * Supports both httpOnly cookies and Authorization Bearer header
 */

const API_BASE = '/api';

let authToken = localStorage.getItem('emergencyinfo_token') || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('emergencyinfo_token', token);
  } else {
    localStorage.removeItem('emergencyinfo_token');
  }
};

export const getStoredAuthToken = () => {
  return authToken || localStorage.getItem('emergencyinfo_token');
};

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getStoredAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Send cookies
    });
  } catch (networkErr) {
    const error = new Error('Cannot connect to the server. Please verify the backend is running.');
    error.status = 503;
    throw error;
  }

  // Parse response as JSON or fallback to text
  const contentType = response.headers.get('content-type') || '';
  let data = {};
  let rawText = '';

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    rawText = await response.text().catch(() => '');
  }

  if (!response.ok) {
    let errorMessage = data.message;
    if (!errorMessage && rawText) {
      if (rawText.includes('ECONNREFUSED') || rawText.includes('Proxy error')) {
        errorMessage = 'Backend API server is currently unavailable (port 5000).';
      } else if (rawText.length < 200) {
        errorMessage = rawText;
      }
    }
    if (!errorMessage) {
      errorMessage = response.status === 500
        ? 'Internal server error. Please try again later.'
        : `Request failed with status ${response.status}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.errors = data.errors;
    error.requiresPin = data.requiresPin;
    error.remainingAttempts = data.remainingAttempts;
    error.lockedUntil = data.lockedUntil;
    throw error;
  }

  return data;
};

export const api = {
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me')
  },
  contacts: {
    getAll: () => request('/contacts'),
    create: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' })
  },
  instructions: {
    getAll: () => request('/instructions'),
    create: (data) => request('/instructions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/instructions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/instructions/${id}`, { method: 'DELETE' })
  },
  shareLinks: {
    getAll: () => request('/share-links'),
    create: (data) => request('/share-links', { method: 'POST', body: JSON.stringify(data) }),
    revoke: (id) => request(`/share-links/${id}`, { method: 'DELETE' })
  },
  emergency: {
    getStatus: (token) => request(`/emergency/${token}`),
    getPayload: (token, pin) => request(`/emergency/${token}`, {
      method: 'POST',
      body: JSON.stringify(pin ? { pin } : {})
    })
  },
  account: {
    deleteAccount: (password) => request('/account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    })
  }
};
