/* home.js — Home page: hero slider, season/state filters, destination cards */

if (!api.requireAuth()) throw new Error('Not authenticated');

let currentPage = 0;
let currentSeason = '';
let currentState = '';
let totalPages = 0;
let heroInterval;

const FOOD_EMOJIS = ['🍛', '🍱', '🥘', '🍲', '🫕', '🥗', '🍜', '🥙', '🫔', '🍢'];
const SEASON_ICONS = { SUMMER: '🌞', WINTER: '❄️', MONSOON: '🌧️', ALL_SEASON: '✨' };

// ── INIT ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    initNavUser();
    await Promise.all([loadFeaturedHero(), loadStates(), loadWishlistCount()]);
    await loadDestinations();
});

// ── HERO SLIDER ────────────────────────────────
async function loadFeaturedHero() {
    try {
        const res = await api.fetch('/destinations/featured');
        const items = await res.json();
        const slider = document.getElementById('hero-slider');
        const dots = document.getElementById('hero-dots');
        const title = document.getElementById('hero-title');
        const sub = document.getElementById('hero-sub');

        if (!items.length) return;

        items.slice(0, 5).forEach((d, i) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${i === 0 ? 'active' : ''}`;
            if (d.imageUrl) slide.style.backgroundImage = `url('${d.imageUrl}')`;
            slide.dataset.name = d.name;
            slide.dataset.exp = d.travelExperience;
            slider.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = `hero-dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            dots.appendChild(dot);
        });

        updateHeroText(items[0]);
        startHeroSlider(items);
    } catch (e) { console.warn('Hero load error', e); }
}

function startHeroSlider(items) {
    let idx = 0;
    heroInterval = setInterval(() => {
        idx = (idx + 1) % items.length;
        goToSlide(idx, items);
    }, 5000);
}

function goToSlide(idx, items) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (items?.[idx]) updateHeroText(items[idx]);
}

function updateHeroText(d) {
    document.getElementById('hero-title').textContent = d.name;
    document.getElementById('hero-sub').textContent = d.shortDescription || d.travelExperience;
}

// ── STATES DROPDOWN ────────────────────────────
async function loadStates() {
    try {
        const res = await api.fetch('/destinations/states');
        const states = await res.json();
        const sel = document.getElementById('state-select');
        states.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            sel.appendChild(opt);
        });
    } catch (e) { console.warn('States load error', e); }
}

// ── DESTINATIONS GRID ──────────────────────────
async function loadDestinations(page = 0) {
    const grid = document.getElementById('destinations-grid');
    grid.innerHTML = Array.from({ length: 6 }, () => '<div class="dest-card skeleton"></div>').join('');

    try {
        const params = new URLSearchParams({ page, size: 12 });
        if (currentSeason) params.set('season', currentSeason);
        if (currentState) params.set('state', currentState);

        const res = await api.fetch(`/destinations?${params}`);
        const data = await res.json();

        totalPages = data.totalPages;
        currentPage = data.currentPage;

        document.getElementById('results-count').textContent =
            `${data.totalElements} destination${data.totalElements !== 1 ? 's' : ''} found`;

        if (!data.content.length) {
            grid.innerHTML = '<div style="color:var(--text-muted);grid-column:1/-1;padding:40px;text-align:center;">No destinations found for this filter 😕</div>';
            return;
        }

        const wishlistSet = await getWishlistIds();
        grid.innerHTML = '';
        data.content.forEach(d => grid.appendChild(createCard(d, wishlistSet)));
        renderPagination();

    } catch (e) {
        console.error('Destinations load error', e);
        grid.innerHTML = '<div style="color:var(--danger);grid-column:1/-1;padding:40px;text-align:center;">Failed to load destinations. Is the backend running?</div>';
    }
}

async function getWishlistIds() {
    try {
        const res = await api.fetch('/wishlist');
        if (!res.ok) return new Set();
        const items = await res.json();
        return new Set(items.map(d => d.id));
    } catch { return new Set(); }
}

function createCard(d, savedSet) {
    const div = document.createElement('div');
    div.className = 'dest-card';
    const seasons = d.season ? d.season.split(',') : [];
    const isSaved = savedSet.has(d.id);

    let photos = DEST_IMAGES && DEST_IMAGES[d.name] ? [...DEST_IMAGES[d.name]] : [];
    if (photos.length === 0 && d.imageUrl) photos.push(d.imageUrl);
    if (photos.length === 0) photos.push('img/placeholder.jpg'); // Fallback

    const sliderHtml = photos.map((url, i) => 
        `<img src="${url}" alt="${d.name}" loading="lazy" class="card-slide ${i === 0 ? 'active' : ''}" onerror="this.src='https://loremflickr.com/800/600/india,landscape/all'">`
    ).join('');

    div.innerHTML = `
    <div class="card-image-wrap card-slider-wrap">
      ${sliderHtml}
      <div class="card-slider-nav">
        <button class="slider-btn prev" onclick="event.stopPropagation(); window.slideCard(this, -1)">❮</button>
        <button class="slider-btn next" onclick="event.stopPropagation(); window.slideCard(this, 1)">❯</button>
      </div>
      <div class="card-image-placeholder" style="display:none">
        ${FOOD_EMOJIS[d.id % FOOD_EMOJIS.length]}
      </div>
      <span class="card-state-badge">${d.state}</span>
      <button class="card-wishlist-btn ${isSaved ? 'saved' : ''}" 
              id="wl-${d.id}" 
              onclick="event.stopPropagation(); toggleCardWishlist(${d.id})"
              title="${isSaved ? 'Remove from wishlist' : 'Add to wishlist'}">
        ${isSaved ? '❤️' : '♡'}
      </button>
    </div>
    <div class="card-body">
      <div class="card-seasons">
        ${seasons.map(s => `<span class="season-chip chip-${s.trim()}">${SEASON_ICONS[s.trim()] || '🌍'} ${s.trim().replace('_', ' ')}</span>`).join('')}
      </div>
      <div class="card-name">${d.name}</div>
      <div class="card-exp">${d.travelExperience || ''}</div>
      <div class="card-footer">
        <span class="card-cost">₹${d.avgCost2d1nInr?.toLocaleString('en-IN')} / 2 days</span>
        <a class="card-explore-btn" href="destination.html?id=${d.id}">Explore →</a>
      </div>
    </div>`;
    div.addEventListener('click', (e) => {
        if (!e.target.closest('.card-wishlist-btn') && !e.target.closest('.card-explore-btn'))
            window.location.href = `destination.html?id=${d.id}`;
    });
    return div;
}

// ── WISHLIST TOGGLE ────────────────────────────
async function toggleCardWishlist(id) {
    const btn = document.getElementById(`wl-${id}`);
    const isSaved = btn.classList.contains('saved');
    const method = isSaved ? 'DELETE' : 'POST';
    try {
        const res = await api.fetch(`/wishlist/${id}`, { method });
        if (res.ok || res.status === 204 || res.status === 201 || res.status === 409) {
            btn.classList.toggle('saved', !isSaved);
            btn.textContent = !isSaved ? '❤️' : '♡';
            loadWishlistCount();
        }
    } catch (e) { console.error('Wishlist toggle failed', e); }
}

async function loadWishlistCount() {
    try {
        const res = await api.fetch('/wishlist/count');
        if (!res.ok) return;
        const data = await res.json();
        const badge = document.getElementById('wishlist-badge');
        if (badge) badge.textContent = data.count;
    } catch { }
}

// ── FILTERS ────────────────────────────────────
function filterSeason(el, season) {
    document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentSeason = season;
    currentPage = 0;
    loadDestinations(0);
}

function filterState(state) {
    currentState = state;
    currentPage = 0;
    loadDestinations(0);
}

// ── PAGINATION ─────────────────────────────────
function renderPagination() {
    const el = document.getElementById('pagination');
    el.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'page-btn'; prev.textContent = '←';
    prev.disabled = currentPage === 0;
    prev.onclick = () => loadDestinations(currentPage - 1);
    el.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i + 1;
        btn.onclick = () => loadDestinations(i);
        el.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn'; next.textContent = '→';
    next.disabled = currentPage === totalPages - 1;
    next.onclick = () => loadDestinations(currentPage + 1);
    el.appendChild(next);
}

// ── SEARCH ─────────────────────────────────────
let searchTimeout;
function debounceSearch(q) {
    clearTimeout(searchTimeout);
    const resultsEl = document.getElementById('search-results');
    if (!q || q.length < 2) { resultsEl.classList.add('hidden'); return; }
    searchTimeout = setTimeout(() => performSearch(q), 350);
}

async function performSearch(q) {
    const resultsEl = document.getElementById('search-results');
    try {
        const res = await api.fetch(`/destinations/search?q=${encodeURIComponent(q)}`);
        const items = await res.json();
        if (!items.length) { resultsEl.classList.add('hidden'); return; }
        resultsEl.innerHTML = items.slice(0, 6).map(d => `
      <a class="search-result-item" href="destination.html?id=${d.id}">
        ${d.imageUrl ? `<img class="search-result-img" src="${d.imageUrl}" alt="${d.name}" onerror="this.style.display='none'">` : '<span style="font-size:1.6rem">📍</span>'}
        <div class="search-result-info">
          <div class="name">${d.name}</div>
          <div class="state">${d.state} · ${d.travelExperience}</div>
        </div>
      </a>`).join('');
        resultsEl.classList.remove('hidden');
    } catch (e) { console.error('Search failed', e); }
}

document.getElementById('search-input')?.addEventListener('blur', () => {
    setTimeout(() => document.getElementById('search-results').classList.add('hidden'), 200);
});

// ── SLIDER SCRIPT ────────────────────────────────
window.slideCard = function(btn, dir) {
    const wrap = btn.closest('.card-slider-wrap');
    const slides = Array.from(wrap.querySelectorAll('img.card-slide')).filter(img => img.style.display !== 'none');
    if (slides.length <= 1) return;
    
    let activeIdx = 0;
    slides.forEach((s, i) => { if (s.classList.contains('active')) activeIdx = i; });
    
    slides[activeIdx].classList.remove('active');
    let nextIdx = (activeIdx + dir + slides.length) % slides.length;
    slides[nextIdx].classList.add('active');
};
