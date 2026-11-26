const TOKEN_KEY = 'daffa_superadmin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    signal,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      setToken(null);
      window.dispatchEvent(new Event('daffa:unauthorized'));
    }
    const error = new Error(payload?.error || `Permintaan gagal (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const api = {
  getPublic: (signal) => request('/api/public', { signal }),
  getHealth: () => request('/api/health'),
  contact: (body) => request('/api/contact', { method: 'POST', body }),
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/api/auth/me', { auth: true }),
  bootstrap: () => request('/api/admin/bootstrap', { auth: true }),
  updateSettings: (settings) => request('/api/admin/settings', { method: 'PUT', body: settings, auth: true }),
  create: (collection, item) => request(`/api/admin/${collection}`, { method: 'POST', body: item, auth: true }),
  update: (collection, id, item) => request(`/api/admin/${collection}/${id}`, { method: 'PUT', body: item, auth: true }),
  remove: (collection, id) => request(`/api/admin/${collection}/${id}`, { method: 'DELETE', auth: true }),
  markMessage: (id, read = true) => request(`/api/admin/messages/${id}`, { method: 'PATCH', body: { read }, auth: true }),
  removeMessage: (id) => request(`/api/admin/messages/${id}`, { method: 'DELETE', auth: true }),
  updateAccount: (body) => request('/api/admin/account', { method: 'PUT', body, auth: true }),
  upload: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/api/admin/upload', { method: 'POST', body: form, auth: true });
  },
};
