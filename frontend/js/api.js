/* api.js — Fully static API layer — NO backend needed!
   All data comes from destinations_data.js (DESTINATIONS array) */

const api = {
  // ── Wishlist (localStorage-based) ────────────────
  getLocalWishlist() {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch { return []; }
  },

  setLocalWishlist(ids) {
    localStorage.setItem('wishlist', JSON.stringify([...new Set(ids)]));
  },

  // ── Static data queries ──────────────────────────
  getAllDestinations() {
    return DESTINATIONS;
  },

  getDestinationById(id) {
    return DESTINATIONS.find(d => d.id === parseInt(id));
  },

  getFeaturedDestinations() {
    return DESTINATIONS.filter(d => d.isFeatured);
  },

  getStates() {
    return [...new Set(DESTINATIONS.map(d => d.state))].sort();
  },

  searchDestinations(query) {
    const q = query.toLowerCase();
    return DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q) ||
      d.travelExperience.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  },

  getFilteredDestinations({ season = '', state = '', page = 0, size = 12 } = {}) {
    let filtered = [...DESTINATIONS];

    if (season) {
      filtered = filtered.filter(d => d.season.includes(season));
    }
    if (state) {
      filtered = filtered.filter(d => d.state === state);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return {
      content,
      totalElements,
      totalPages,
      currentPage: page
    };
  },

  getDestinationsByState(state, excludeId, limit = 4) {
    return DESTINATIONS
      .filter(d => d.state === state && d.id !== parseInt(excludeId))
      .slice(0, limit);
  },

  // ── Wishlist operations ──────────────────────────
  isInWishlist(id) {
    return this.getLocalWishlist().includes(parseInt(id));
  },

  addToWishlist(id) {
    const list = this.getLocalWishlist();
    const numId = parseInt(id);
    if (!list.includes(numId)) {
      list.push(numId);
      this.setLocalWishlist(list);
    }
  },

  removeFromWishlist(id) {
    const list = this.getLocalWishlist();
    this.setLocalWishlist(list.filter(x => x !== parseInt(id)));
  },

  getWishlistCount() {
    return this.getLocalWishlist().length;
  },

  getWishlistDestinations() {
    const ids = this.getLocalWishlist();
    return DESTINATIONS.filter(d => ids.includes(d.id));
  }
};

// Global nav helpers
function initNavUser() {
  // No-op in static version (no auth needed)
}
