const USERS_STORAGE_KEY = 'greencart-users';
const SESSION_STORAGE_KEY = 'greencart-session';

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

export function getStoredUsers() {
  const users = readStorage(USERS_STORAGE_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function getStoredSession() {
  const session = readStorage(SESSION_STORAGE_KEY, null);
  return session && typeof session === 'object' ? session : null;
}

export function saveUsers(users) {
  writeStorage(USERS_STORAGE_KEY, users);
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
