import { store } from './store.js';

const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    store.set('authState', 'reconnect');
    return null;
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  getMe:          ()     => request('GET',    '/auth/me'),
  logout:         ()     => request('POST',   '/auth/logout'),

  // User
  getProfile:     ()     => request('GET',    '/user/profile'),
  updateSettings: (s)    => request('PUT',    '/user/settings', { settings: s }),

  // Emails
  getEmails:      (q)    => request('GET',    `/emails?${new URLSearchParams(q)}`),
  getEmail:       (id)   => request('GET',    `/emails/${id}`),
  syncEmails:     ()     => request('POST',   '/emails/sync'),
  dismissEmail:   (id)   => request('DELETE', `/emails/${id}`),

  // Actions
  getActions:     ()     => request('GET',    '/actions'),
  getDone:        (q)    => request('GET',    `/actions/done?${new URLSearchParams(q)}`),
  implementAction:(id)   => request('POST',   `/actions/${id}/implement`),
  dismissAction:  (id)   => request('POST',   `/actions/${id}/dismiss`),
};
