/* destination.js — Destination detail page */

if (!api.requireAuth()) throw new Error('Not authenticated');

const urlParams = new URLSearchParams(window.location.search);
const destId = urlParams.get('id');
if (!destId) window.location.href = 'index.html';

const SEASON_INFO = {
    SUMMER: { icon: '🌞', label: 'Summer', desc: 'Great time with warm sunny weather. Ideal for sightseeing and outdoor activities.' },
    WINTER: { icon: '❄️', label: 'Winter', desc: 'Cool and pleasant temperatures. Perfect for exploring without the heat.' },
    MONSOON: { icon: '🌧️', label: 'Monsoon', desc: 'Lush greenery and dramatic waterfalls. Some roads may be difficult to navigate.' },
    ALL_SEASON: { icon: '✨', label: 'All Season', desc: 'This destination can be visited year-round with enjoyable weather any time.' }
};
const ALL_SEASONS = ['SUMMER', 'WINTER', 'MONSOON', 'ALL_SEASON'];

let destination = null;
let isSaved = false;

// ── INIT ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    initNavUser();
    await loadDestination();
    await checkWishlistStatus();
    await loadWishlistBadge();
});

async function loadDestination() {
    try {
        const res = await api.fetch(`/destinations/${destId}`);
        if (!res.ok) { window.location.href = 'index.html'; return; }
        destination = await res.json();
        renderDestination(destination);
        document.title = `${destination.name} — Wanderlust India`;
    } catch (e) {
        console.error('Failed to load destination', e);
    }
}

function renderDestination(d) {
    // Hero slider
    const hero = document.getElementById('dest-hero');
    let heroPhotos = typeof DEST_IMAGES !== 'undefined' && DEST_IMAGES[d.name] ? [...DEST_IMAGES[d.name]] : [];
    if (heroPhotos.length === 0 && d.imageUrl) heroPhotos.push(d.imageUrl);
    if (heroPhotos.length === 0) heroPhotos.push('https://loremflickr.com/1200/600/india');
    
    let heroIdx = 0;
    hero.style.transition = 'background-image 1s ease-in-out';
    hero.style.backgroundImage = `url('${heroPhotos[0]}')`;
    
    if (heroPhotos.length > 1) {
        setInterval(() => {
            heroIdx = (heroIdx + 1) % heroPhotos.length;
            
            // prefetch image to avoid flash
            const img = new Image();
            img.onload = () => { hero.style.backgroundImage = `url('${heroPhotos[heroIdx]}')`; };
            img.src = heroPhotos[heroIdx];
        }, 4000);
    }

    document.getElementById('state-crumb').textContent = d.state;
    document.getElementById('dest-name').textContent = d.name;

    const seasons = (d.season || '').split(',').map(s => s.trim());
    document.getElementById('dest-seasons').innerHTML = seasons.map(s =>
        `<span class="season-chip chip-${s}">${SEASON_INFO[s]?.icon || ''} ${(SEASON_INFO[s]?.label || s)}</span>`
    ).join('');

    // Stats
    document.getElementById('stat-cost').textContent = `₹${d.avgCost2d1nInr?.toLocaleString('en-IN')}`;
    document.getElementById('stat-exp').textContent = d.travelExperience || '—';
    document.getElementById('stat-state').textContent = d.state;
    document.getElementById('stat-pop').textContent = `${d.popularityScore?.toFixed(1)} / 10`;

    // About
    document.getElementById('dest-description').textContent = d.description;

    // Food tab
    let foods = [];
    try { foods = JSON.parse(d.localFood || '[]'); } catch { }
    const FOOD_EMOJIS = ['🍛', '🍱', '🥘', '🍲', '🍜', '🥗', '🫕', '🥙', '🍢', '🧆'];
    document.getElementById('food-grid').innerHTML = foods.map((f, i) => `
    <div class="food-item">
      <span class="food-emoji">${FOOD_EMOJIS[i % FOOD_EMOJIS.length]}</span>
      ${f}
    </div>`).join('') || '<p style="color:var(--text-muted)">Local food information coming soon.</p>';

    // Nearby tab
    let nearby = [];
    try { nearby = JSON.parse(d.nearbyAttractions || '[]'); } catch { }
    document.getElementById('nearby-list').innerHTML = nearby.map(a => `
    <div class="nearby-item">
      <div class="nearby-dot"></div>
      <span class="nearby-name">${a}</span>
    </div>`).join('') || '<p style="color:var(--text-muted)">Nearby attractions information coming soon.</p>';

    // Season tab
    const bestSeasons = new Set(seasons);
    document.getElementById('season-suitability').innerHTML = ALL_SEASONS.map(s => {
        const info = SEASON_INFO[s];
        const isBest = bestSeasons.has(s);
        return `
      <div class="season-card ${isBest ? 'best' : ''}">
        <div class="season-card-header">
          <span class="sc-icon">${info.icon}</span>
          <span>${info.label}</span>
          ${isBest ? '<span style="margin-left:auto;font-size:0.72rem;color:var(--primary-light);font-weight:600">✓ Recommended</span>' : ''}
        </div>
        <p class="season-verdict">${isBest ? info.desc : 'Not the ideal time to visit. Weather conditions may not be suitable.'}</p>
      </div>`;
    }).join('');

    // Related destinations (by state)
    loadRelated(d.state, d.id);
    document.getElementById('related-state-name').textContent = d.state;
}

async function loadRelated(state, excludeId) {
    try {
        const res = await api.fetch(`/destinations?state=${encodeURIComponent(state)}&size=4`);
        const data = await res.json();
        const others = (data.content || []).filter(d => d.id != excludeId).slice(0, 3);
        const grid = document.getElementById('related-grid');
        if (!others.length) { grid.parentElement.style.display = 'none'; return; }
        grid.innerHTML = others.map(d => {
            let photos = typeof DEST_IMAGES !== 'undefined' && DEST_IMAGES[d.name] ? [...DEST_IMAGES[d.name]] : [];
            if (photos.length === 0 && d.imageUrl) photos.push(d.imageUrl);
            if (photos.length === 0) photos.push('img/placeholder.jpg');

            const sliderHtml = photos.map((url, i) => 
                `<img src="${url}" alt="${d.name}" loading="lazy" class="card-slide ${i === 0 ? 'active' : ''}" style="height:160px;" onerror="this.src='https://loremflickr.com/800/600/india'">`
            ).join('');

            return `
      <div class="dest-card" style="display:block;cursor:default;">
        <div class="card-image-wrap card-slider-wrap" style="height:160px;cursor:pointer;" onclick="window.location.href='destination.html?id=${d.id}'">
          ${sliderHtml}
          <div class="card-slider-nav">
            <button class="slider-btn prev" onclick="event.stopPropagation(); window.slideCard(this, -1)">❮</button>
            <button class="slider-btn next" onclick="event.stopPropagation(); window.slideCard(this, 1)">❯</button>
          </div>
          <span class="card-state-badge">${d.state}</span>
        </div>
        <div class="card-body" style="cursor:pointer" onclick="window.location.href='destination.html?id=${d.id}'">
          <div class="card-name">${d.name}</div>
          <div class="card-cost" style="color:var(--accent);font-size:0.82rem;font-weight:600;margin-top:6px">₹${d.avgCost2d1nInr?.toLocaleString('en-IN')} / 2 days</div>
        </div>
      </div>`;
        }).join('');
    } catch (e) { console.error('Related load error', e); }
}

// ── WISHLIST ───────────────────────────────────
async function checkWishlistStatus() {
    try {
        const res = await api.fetch(`/wishlist/check/${destId}`);
        const data = await res.json();
        isSaved = data.isSaved;
        updateWishlistBtn();
    } catch { }
}

async function toggleWishlist() {
    const method = isSaved ? 'DELETE' : 'POST';
    try {
        const res = await api.fetch(`/wishlist/${destId}`, { method });
        if (res.ok || res.status === 204 || res.status === 201) {
            isSaved = !isSaved;
            updateWishlistBtn();
            loadWishlistBadge();
        }
    } catch (e) { console.error('Wishlist toggle failed', e); }
}

function updateWishlistBtn() {
    const btn = document.getElementById('wishlist-toggle-btn');
    btn.innerHTML = isSaved ? '❤️ Saved' : '♡ Save';
    btn.classList.toggle('saved', isSaved);
}

async function loadWishlistBadge() {
    try {
        const res = await api.fetch('/wishlist/count');
        if (!res.ok) return;
        const data = await res.json();
        const badge = document.getElementById('wishlist-badge');
        if (badge) badge.textContent = data.count;
    } catch { }
}

// ── DETAIL TABS ────────────────────────────────
function switchDetailTab(tab, el) {
    document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    el.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
}

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
