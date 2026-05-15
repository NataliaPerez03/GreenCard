const SESSION_STORAGE_KEY = 'greencart-session';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

async function apiRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.detail || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getStoredSession() {
  const session = readStorage(SESSION_STORAGE_KEY, null);
  return session && typeof session === 'object' ? session : null;
}

export function saveSession(user) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  writeStorage(SESSION_STORAGE_KEY, user);
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export async function loginUser(credentials) {
  const data = await apiRequest('/api/auth/login', credentials);
  return sanitizeUser(data.user);
}

export async function registerUser(payload) {
  const data = await apiRequest('/api/auth/register', payload);
  return sanitizeUser(data.user);
}
