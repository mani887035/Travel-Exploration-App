'use strict';

const destinations = [
    { name: 'Bali', description: 'A beautiful island in Indonesia.', image: 'bali.jpg' },
    { name: 'Paris', description: 'The city of lights and romance.', image: 'paris.jpg' },
    { name: 'New York', description: 'The city that never sleeps.', image: 'new-york.jpg' }
];

// Pre-rendered HTML
const renderDestinations = () => {
    const destinationList = destinations.map(destination => `
        <div class="destination">
            <h2>${destination.name}</h2>
            <img src="${destination.image}" alt="${destination.name}" />
            <p>${destination.description}</p>
        </div>
    `).join('');

    document.getElementById('destination-container').innerHTML = destinationList;
};

// Static initialization
document.addEventListener('DOMContentLoaded', () => {
    renderDestinations();
});
