/* api.js — Central API module for all fetch calls */
const API_BASE = 'http://localhost:8080/api';

const api = {
  getToken() {
    return localStorage.getItem('accessToken');
  },

  saveAuth(data) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  requireAuth() {
    return true; // Authentication bypassed as login page was removed
  },

  // Helper for guests
  getLocalWishlist() {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch { return []; }
  },

  setLocalWishlist(ids) {
    localStorage.setItem('wishlist', JSON.stringify([...new Set(ids)]));
  },

  async handleLocalWishlist(endpoint, options) {
    const list = this.getLocalWishlist();
    
    // GET /wishlist
    if (endpoint === '/wishlist' && (!options.method || options.method === 'GET')) {
      if (list.length === 0) return { ok: true, status: 200, json: async () => [] };
      const res = await fetch(API_BASE + '/destinations/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
      return res;
    }

    // GET /wishlist/count
    if (endpoint === '/wishlist/count') {
      return { ok: true, status: 200, json: async () => ({ count: list.length }) };
    }

    // GET /wishlist/check/{id}
    const checkMatch = endpoint.match(/\/wishlist\/check\/(\d+)/);
    if (checkMatch) {
      const id = parseInt(checkMatch[1]);
      return { ok: true, status: 200, json: async () => ({ isSaved: list.includes(id) }) };
    }

    // POST/DELETE /wishlist/{id}
    const postMatch = endpoint.match(/\/wishlist\/(\d+)/);
    if (postMatch) {
      const id = parseInt(postMatch[1]);
      if (options.method === 'POST') {
        if (!list.includes(id)) {
          list.push(id);
          this.setLocalWishlist(list);
        }
        return { ok: true, status: 201, json: async () => ({ success: true }) };
      }
      if (options.method === 'DELETE') {
        this.setLocalWishlist(list.filter(x => x !== id));
        return { ok: true, status: 204 };
      }
    }

    return { ok: false, status: 404 };
  },

  async fetch(endpoint, options = {}) {
    // Intercept wishlist for guests
    if (!this.isLoggedIn() && endpoint.startsWith('/wishlist')) {
        return this.handleLocalWishlist(endpoint, options);
    }

    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(API_BASE + endpoint, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401 && localStorage.getItem('refreshToken')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`;
        res = await fetch(API_BASE + endpoint, { ...options, headers });
      } else {
        this.clearAuth();
        window.location.href = 'index.html';
      }
    }
    return res;
  },

  async refreshToken() {
    try {
      const res = await fetch(API_BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    } catch {
      return false;
    }
  }
};

// Global nav helpers used on multiple pages
function logout() {
  api.clearAuth();
  window.location.href = 'index.html';
}

function toggleUserMenu() {
  document.getElementById('user-menu')?.classList.toggle('hidden');
}

function initNavUser() {
  const user = api.getUser();
  if (!user) return;
  const avatar = document.getElementById('user-avatar');
  const menuName = document.getElementById('user-menu-name');
  if (avatar) avatar.textContent = user.name ? user.name[0].toUpperCase() : 'U';
  if (menuName) menuName.textContent = user.name || user.email;
}

// Close user menu on outside click
document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.user-avatar-wrap');
  const menu = document.getElementById('user-menu');
  if (menu && wrap && !wrap.contains(e.target)) menu.classList.add('hidden');
});
