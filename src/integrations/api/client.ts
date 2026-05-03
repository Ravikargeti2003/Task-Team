// const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// function getToken(): string | null {
//   return localStorage.getItem('auth_token');
// }

// export function setToken(token: string) {
//   localStorage.setItem('auth_token', token);
// }

// export function clearToken() {
//   localStorage.removeItem('auth_token');
//   localStorage.removeItem('auth_user');
// }

// export function getStoredUser() {
//   const u = localStorage.getItem('auth_user');
//   return u ? JSON.parse(u) : null;
// }

// export function setStoredUser(user: any) {
//   localStorage.setItem('auth_user', JSON.stringify(user));
// }

// async function request(path: string, options: RequestInit = {}) {
//   const token = getToken();
//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//     ...(options.headers as Record<string, string>),
//   };
//   if (token) headers['Authorization'] = `Bearer ${token}`;

//   const res = await fetch(`${BASE}${path}`, { ...options, headers });
//   const data = await res.json().catch(() => ({}));

//   if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
//   return data;
// }

// export const api = {
//   get: (path: string) => request(path),
//   post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
//   patch: (path: string, body: any) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
//   delete: (path: string) => request(path, { method: 'DELETE' }),
// };



const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredUser() {
  const u = localStorage.getItem('auth_user');
  return u ? JSON.parse(u) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: any) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};