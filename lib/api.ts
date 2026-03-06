const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export const api = {
  login: (credentials: any) => fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(async r => {
    if (!r.ok) {
      const err = await r.json()
      throw new Error(err.message || 'Invalid credentials')
    }
    return r.json()
  }),
  getCustomers: (userId?: string) => {
    const url = userId ? `${API_BASE}/customers?userId=${userId}` : `${API_BASE}/customers`;
    return fetch(url).then(r => r.json());
  },
  addCustomer: (c: any) => fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c)
  }).then(r => r.json()),
  updateCustomer: (id: string, c: any, userId?: string) => {
    const url = userId ? `${API_BASE}/customers/${id}?userId=${userId}` : `${API_BASE}/customers/${id}`;
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c)
    }).then(r => r.json());
  },
  deleteCustomer: (id: string, userId?: string) => {
    const url = userId ? `${API_BASE}/customers/${id}?userId=${userId}` : `${API_BASE}/customers/${id}`;
    return fetch(url, { method: 'DELETE' });
  },

  getLoans: (userId?: string) => {
    const url = userId ? `${API_BASE}/loans?userId=${userId}` : `${API_BASE}/loans`;
    return fetch(url).then(r => r.json());
  },
  addLoan: (l: any) => fetch(`${API_BASE}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(l)
  }).then(r => r.json()),
  deleteLoan: (id: string, userId?: string) => {
    const url = userId ? `${API_BASE}/loans/${id}?userId=${userId}` : `${API_BASE}/loans/${id}`;
    return fetch(url, { method: 'DELETE' }).then(r => {
      if (!r.ok) throw new Error('Failed to delete loan')
    });
  },
  closeLoan: (id: string, data: any, userId?: string) => {
    const url = userId ? `${API_BASE}/loans/${id}/close?userId=${userId}` : `${API_BASE}/loans/${id}/close`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: `HTTP ${r.status}: ${r.statusText}` }))
        throw new Error(err.message || 'Failed to close loan')
      }
      return r.json()
    });
  },


  getPayments: (userId?: string) => {
    const url = userId ? `${API_BASE}/payments?userId=${userId}` : `${API_BASE}/payments`;
    return fetch(url).then(r => r.json());
  },
  addPayment: (p: any) => fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p)
  }).then(r => r.json()),
  updatePayment: (id: string, p: any, userId?: string) => {
    const url = userId ? `${API_BASE}/payments/${id}?userId=${userId}` : `${API_BASE}/payments/${id}`;
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    }).then(r => r.json());
  },
  deletePayment: (id: string, userId?: string) => {
    const url = userId ? `${API_BASE}/payments/${id}?userId=${userId}` : `${API_BASE}/payments/${id}`;
    return fetch(url, { method: 'DELETE' });
  },


  getNotifications: (userId?: string) => {
    const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
    return fetch(url).then(r => r.json());
  },
  markNotificationRead: (id: string) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' }).then(r => r.json()),

  getSettings: () => fetch(`${API_BASE}/settings`).then(r => r.json()),
  updateSettings: (s: any) => fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s)
  }).then(r => r.json()),
  changePassword: (userId: string, data: any) => fetch(`${API_BASE}/users/${userId}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(async r => {
    if (!r.ok) {
      const err = await r.json()
      throw new Error(err.message || 'Failed to update password')
    }
    return r.json()
  }),
};
