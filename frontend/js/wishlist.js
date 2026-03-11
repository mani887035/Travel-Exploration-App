/* wishlist.js — Wishlist page */

if (!api.requireAuth()) throw new Error('Not authenticated');

const FOOD_EMOJIS = ['🏔️', '🏖️', '🌿', '🏰', '⛵', '🕌', '🦁', '🌸', '🏛️', '🌊'];
const SEASON_ICONS = { SUMMER: '🌞', WINTER: '❄️', MONSOON: '🌧️', ALL_SEASON: '✨' };

window.addEventListener('DOMContentLoaded', async () => {
    initNavUser();
    await loadWishlist();
});

async function loadWishlist() {
    try {
        const res = await api.fetch('/wishlist');
        if (!res.ok) throw new Error('Failed to load');
        const items = await res.json();

        const countEl = document.getElementById('wishlist-count');
        const emptyEl = document.getElementById('empty-state');
        const grid = document.getElementById('wishlist-grid');

        countEl.textContent = `${items.length} place${items.length !== 1 ? 's' : ''} saved`;

        if (!items.length) {
            emptyEl.classList.remove('hidden');
            grid.innerHTML = '';
            return;
        }

        emptyEl.classList.add('hidden');
        grid.innerHTML = '';
        items.forEach((d, i) => grid.appendChild(createWishlistCard(d, i)));
    } catch (e) {
        console.error('Wishlist load error', e);
    }
}

function createWishlistCard(d, idx) {
    const div = document.createElement('div');
    div.className = 'dest-card';
    div.id = `card-${d.id}`;
    const seasons = d.season ? d.season.split(',') : [];

    div.innerHTML = `
    <div class="card-image-wrap">
      ${d.imageUrl
            ? `<img src="${d.imageUrl}" alt="${d.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''}
      <div class="card-image-placeholder" ${d.imageUrl ? 'style="display:none"' : ''}>
        ${FOOD_EMOJIS[idx % FOOD_EMOJIS.length]}
      </div>
      <span class="card-state-badge">${d.state}</span>
      <button class="card-wishlist-btn saved" onclick="event.stopPropagation(); removeFromWishlist(${d.id})" title="Remove from wishlist">❤️</button>
    </div>
    <div class="card-body">
      <div class="card-seasons">
        ${seasons.map(s => `<span class="season-chip chip-${s.trim()}">${SEASON_ICONS[s.trim()] || ''} ${s.trim().replace('_', ' ')}</span>`).join('')}
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

async function removeFromWishlist(id) {
    try {
        const res = await api.fetch(`/wishlist/${id}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            const card = document.getElementById(`card-${id}`);
            card.style.opacity = '0'; card.style.transform = 'scale(0.9)';
            card.style.transition = 'all 0.3s';
            setTimeout(() => { card.remove(); refreshCount(); }, 300);
        }
    } catch (e) { console.error('Remove failed', e); }
}

function refreshCount() {
    const remaining = document.querySelectorAll('.dest-card:not(.skeleton)').length;
    document.getElementById('wishlist-count').textContent = `${remaining} place${remaining !== 1 ? 's' : ''} saved`;
    if (!remaining) {
        document.getElementById('empty-state').classList.remove('hidden');
    }
}
