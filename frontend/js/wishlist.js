/* wishlist.js — Wishlist page (fully static, localStorage-only) */

const FOOD_EMOJIS_WL = ['🏔️', '🏖️', '🌿', '🏰', '⛵', '🕌', '🦁', '🌸', '🏛️', '🌊'];
const SEASON_ICONS_WL = { SUMMER: '🌞', WINTER: '❄️', MONSOON: '🌧️', ALL_SEASON: '✨' };

window.addEventListener('DOMContentLoaded', () => {
    initNavUser();
    loadWishlist();
});

function loadWishlist() {
    const items = api.getWishlistDestinations();

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
}

function createWishlistCard(d, idx) {
    const div = document.createElement('div');
    div.className = 'dest-card';
    div.id = `card-${d.id}`;
    const seasons = d.season ? d.season.split(',') : [];

    // Get image from DEST_IMAGES or fallback to imageUrl
    let imgSrc = d.imageUrl;
    if (typeof DEST_IMAGES !== 'undefined' && DEST_IMAGES[d.name] && DEST_IMAGES[d.name][0]) {
        imgSrc = DEST_IMAGES[d.name][0];
    }

    div.innerHTML = `
    <div class="card-image-wrap">
      ${imgSrc
            ? `<img src="${imgSrc}" alt="${d.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''}
      <div class="card-image-placeholder" ${imgSrc ? 'style="display:none"' : ''}>
        ${FOOD_EMOJIS_WL[idx % FOOD_EMOJIS_WL.length]}
      </div>
      <span class="card-state-badge">${d.state}</span>
      <button class="card-wishlist-btn saved" onclick="event.stopPropagation(); removeFromWishlist(${d.id})" title="Remove from wishlist">❤️</button>
    </div>
    <div class="card-body">
      <div class="card-seasons">
        ${seasons.map(s => `<span class="season-chip chip-${s.trim()}">${SEASON_ICONS_WL[s.trim()] || ''} ${s.trim().replace('_', ' ')}</span>`).join('')}
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

function removeFromWishlist(id) {
    api.removeFromWishlist(id);
    const card = document.getElementById(`card-${id}`);
    card.style.opacity = '0'; card.style.transform = 'scale(0.9)';
    card.style.transition = 'all 0.3s';
    setTimeout(() => { card.remove(); refreshCount(); }, 300);
}

function refreshCount() {
    const remaining = document.querySelectorAll('.dest-card:not(.skeleton)').length;
    document.getElementById('wishlist-count').textContent = `${remaining} place${remaining !== 1 ? 's' : ''} saved`;
    if (!remaining) {
        document.getElementById('empty-state').classList.remove('hidden');
    }
}
