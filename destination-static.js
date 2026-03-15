'use strict';

// Static destination object
const destination = {
    name: 'Paris',
    country: 'France',
    description: 'The City of Light, known for its art, fashion, and culture.',
    attractions: [
        'Eiffel Tower',
        'Louvre Museum',
        'Notre-Dame Cathedral',
        'Montmartre',
        'Champs-Élysées'
    ],
    bestTimeToVisit: 'April to June and September to October'
};

// Pre-rendered content section
const renderDestination = () => {
    const contentDiv = document.getElementById('destination-content');
    contentDiv.innerHTML = `
        <h1>${destination.name}</h1>
        <h2>Country: ${destination.country}</h2>
        <p>${destination.description}</p>
        <h3>Attractions:</h3>
        <ul>
            ${destination.attractions.map(attraction => `<li>${attraction}</li>`).join('')}
        </ul>
        <p>Best Time to Visit: ${destination.bestTimeToVisit}</p>
    `;
};

// Call the render function to display content
window.onload = renderDestination;