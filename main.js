document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const destinationsGrid = document.querySelector('.destinations-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const sendMessage = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    // Initial load
    fetchDestinations('all');

    // Filter Listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Fetch data
            const type = btn.dataset.filter;
            fetchDestinations(type);
        });
    });

    // Chat Listeners
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.add('open');
        chatToggle.style.transform = 'scale(0)';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        chatToggle.style.transform = 'scale(1)';
    });

    sendMessage.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });

    // Functions
    async function fetchDestinations(type) {
        try {
            const response = await fetch(`/api/explore?type=${type}`);
            const data = await response.json();
            renderDestinations(data);
        } catch (error) {
            console.error('Error fetching destinations:', error);
            destinationsGrid.innerHTML = '<p class="error">Failed to load destinations.</p>';
        }
    }

    function renderDestinations(destinations) {
        destinationsGrid.innerHTML = '';

        if (destinations.length === 0) {
            destinationsGrid.innerHTML = '<p>No destinations found for this category.</p>';
            return;
        }

        destinations.forEach(dest => {
            const card = document.createElement('div');
            card.className = 'card';

            // Icon based on type
            let icon = 'fa-globe';
            if (dest.type === 'Beach') icon = 'fa-umbrella-beach';
            else if (dest.type === 'Mountain') icon = 'fa-mountain';
            else if (dest.type === 'City') icon = 'fa-city';
            else if (dest.type === 'Cultural') icon = 'fa-landmark';

            card.innerHTML = `
                <div class="card-img-placeholder">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${dest.name}</h3>
                        <span class="card-badge">${dest.type}</span>
                    </div>
                    <p class="card-desc">${dest.description}</p>
                </div>
            `;
            destinationsGrid.appendChild(card);
        });
    }

    async function sendUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Add user message
        appendMessage(text, 'user');
        userInput.value = '';

        // Show typing indicator (optional)
        const loadingId = appendLoading();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            const data = await response.json();

            // Remove loading
            document.getElementById(loadingId).remove();

            // Add bot response
            appendMessage(data.answer, 'bot');

        } catch (error) {
            console.error('Error sending message:', error);
            document.getElementById(loadingId).remove();
            appendMessage("Sorry, I'm having trouble connecting right now.", 'bot');
        }
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendLoading() {
        const id = 'loading-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.className = 'typing-indicator';
        msgDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }
});
