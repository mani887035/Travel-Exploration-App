/* chatbot.js — Static AI Travel Chatbot Widget (no backend needed!)
   Uses the destination data to answer common travel questions */

let chatOpen = false;

function toggleChatbot() {
    chatOpen = !chatOpen;
    const panel = document.getElementById('chatbot-panel');
    panel.classList.toggle('hidden', !chatOpen);
    if (chatOpen) {
        document.getElementById('chatbot-input')?.focus();
    }
}

function askSuggestion(question) {
    document.getElementById('chatbot-input').value = question;
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.style.display = 'none';
    sendChat();
}

function sendChat() {
    const input = document.getElementById('chatbot-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    appendMessage(question, 'user');
    showTyping(true);

    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.style.display = 'none';

    // Simulate typing delay
    setTimeout(() => {
        showTyping(false);
        const answer = generateAnswer(question);
        appendMessage(answer.text, 'ai', answer.sources || []);
    }, 600 + Math.random() * 800);
}

function generateAnswer(question) {
    const q = question.toLowerCase();
    const allDests = typeof DESTINATIONS !== 'undefined' ? DESTINATIONS : [];

    // Check if asking about a specific destination
    const matchedDest = allDests.find(d => q.includes(d.name.toLowerCase()));
    if (matchedDest) {
        let foods = [];
        try { foods = JSON.parse(matchedDest.localFood || '[]'); } catch {}
        let nearby = [];
        try { nearby = JSON.parse(matchedDest.nearbyAttractions || '[]'); } catch {}

        let response = `📍 **${matchedDest.name}** (${matchedDest.state})\n\n`;
        response += `${matchedDest.shortDescription}\n\n`;
        response += `🎯 Experience: ${matchedDest.travelExperience}\n`;
        response += `💰 Avg Cost: ₹${matchedDest.avgCost2d1nInr?.toLocaleString('en-IN')} for 2 days\n`;
        response += `🌤️ Best Season: ${matchedDest.season.replace(/,/g, ', ').replace(/_/g, ' ')}\n`;
        response += `⭐ Popularity: ${matchedDest.popularityScore}/10\n`;
        if (foods.length) response += `\n🍽️ Must-try: ${foods.slice(0, 3).join(', ')}`;
        if (nearby.length) response += `\n📍 Nearby: ${nearby.slice(0, 3).join(', ')}`;

        return {
            text: response,
            sources: [{ name: matchedDest.name, id: matchedDest.id }]
        };
    }

    // Winter destinations
    if (q.includes('winter')) {
        const winterDests = allDests.filter(d => d.season.includes('WINTER')).slice(0, 5);
        return {
            text: `❄️ Best winter destinations in India:\n\n${winterDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription} ₹${d.avgCost2d1nInr?.toLocaleString('en-IN')}/2 days`).join('\n')}`,
            sources: winterDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Summer destinations
    if (q.includes('summer')) {
        const summerDests = allDests.filter(d => d.season.includes('SUMMER')).slice(0, 5);
        return {
            text: `🌞 Best summer destinations in India:\n\n${summerDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription} ₹${d.avgCost2d1nInr?.toLocaleString('en-IN')}/2 days`).join('\n')}`,
            sources: summerDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Monsoon destinations
    if (q.includes('monsoon') || q.includes('rain')) {
        const monsoonDests = allDests.filter(d => d.season.includes('MONSOON')).slice(0, 5);
        return {
            text: `🌧️ Best monsoon destinations in India:\n\n${monsoonDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription} ₹${d.avgCost2d1nInr?.toLocaleString('en-IN')}/2 days`).join('\n')}`,
            sources: monsoonDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Budget trips
    if (q.includes('budget') || q.includes('cheap') || q.includes('affordable')) {
        const budgetDests = [...allDests].sort((a, b) => a.avgCost2d1nInr - b.avgCost2d1nInr).slice(0, 5);
        return {
            text: `💰 Most affordable destinations in India:\n\n${budgetDests.map(d => `• ${d.name} (${d.state}) — ₹${d.avgCost2d1nInr?.toLocaleString('en-IN')}/2 days — ${d.travelExperience}`).join('\n')}`,
            sources: budgetDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Hill stations
    if (q.includes('hill') || q.includes('mountain') || q.includes('cold')) {
        const hillDests = allDests.filter(d =>
            d.travelExperience.toLowerCase().includes('hill') ||
            d.travelExperience.toLowerCase().includes('adventure') ||
            d.travelExperience.toLowerCase().includes('snow')
        ).slice(0, 5);
        return {
            text: `🏔️ Best hill stations & mountain destinations:\n\n${hillDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription}`).join('\n')}`,
            sources: hillDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Beach destinations
    if (q.includes('beach') || q.includes('sea') || q.includes('coast')) {
        const beachDests = allDests.filter(d =>
            d.travelExperience.toLowerCase().includes('beach') ||
            d.travelExperience.toLowerCase().includes('backwater')
        ).slice(0, 5);
        return {
            text: `🏖️ Best beach destinations in India:\n\n${beachDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription}`).join('\n')}`,
            sources: beachDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Heritage / temple / cultural
    if (q.includes('heritage') || q.includes('temple') || q.includes('cultural') || q.includes('history')) {
        const heritageDests = allDests.filter(d =>
            d.travelExperience.toLowerCase().includes('heritage') ||
            d.travelExperience.toLowerCase().includes('cultural') ||
            d.travelExperience.toLowerCase().includes('temple')
        ).slice(0, 5);
        return {
            text: `🏛️ Best heritage & cultural destinations:\n\n${heritageDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription}`).join('\n')}`,
            sources: heritageDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Wildlife / safari
    if (q.includes('wildlife') || q.includes('safari') || q.includes('tiger') || q.includes('animal')) {
        const wildlifeDests = allDests.filter(d =>
            d.travelExperience.toLowerCase().includes('wildlife') ||
            d.travelExperience.toLowerCase().includes('safari')
        ).slice(0, 5);
        return {
            text: `🦁 Best wildlife & safari destinations:\n\n${wildlifeDests.map(d => `• ${d.name} (${d.state}) — ${d.shortDescription}`).join('\n')}`,
            sources: wildlifeDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Best / popular / top
    if (q.includes('best') || q.includes('popular') || q.includes('top') || q.includes('recommend')) {
        const topDests = [...allDests].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 5);
        return {
            text: `⭐ Most popular destinations in India:\n\n${topDests.map(d => `• ${d.name} (${d.state}) — ⭐ ${d.popularityScore}/10 — ${d.shortDescription}`).join('\n')}`,
            sources: topDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Food
    if (q.includes('food') || q.includes('eat') || q.includes('cuisine') || q.includes('dish')) {
        const foodDests = allDests.slice(0, 5);
        const foodInfo = foodDests.map(d => {
            let foods = [];
            try { foods = JSON.parse(d.localFood || '[]'); } catch {}
            return `• ${d.name}: ${foods.slice(0, 3).join(', ')}`;
        });
        return {
            text: `🍽️ Famous local foods across India:\n\n${foodInfo.join('\n')}`,
            sources: foodDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // State-specific
    const stateMatch = allDests.find(d => q.includes(d.state.toLowerCase()));
    if (stateMatch) {
        const stateDests = allDests.filter(d => d.state === stateMatch.state).slice(0, 5);
        return {
            text: `📍 Destinations in ${stateMatch.state}:\n\n${stateDests.map(d => `• ${d.name} — ${d.shortDescription} (₹${d.avgCost2d1nInr?.toLocaleString('en-IN')}/2 days)`).join('\n')}`,
            sources: stateDests.map(d => ({ name: d.name, id: d.id }))
        };
    }

    // Default response
    return {
        text: `Namaste! 🙏 I can help you find destinations in India! Try asking about:\n\n• A specific place (e.g., "Tell me about Jaipur")\n• Season recommendations (e.g., "Best places in winter")\n• Budget trips (e.g., "Cheap budget destinations")\n• Activities (e.g., "Best hill stations", "Beach destinations")\n• Heritage & temples\n• Wildlife & safari\n• Food recommendations\n\nI have information on ${allDests.length} amazing Indian destinations! 🌏`,
        sources: []
    };
}

function appendMessage(text, role, sources = []) {
    const messages = document.getElementById('chatbot-messages');
    const isAi = role === 'ai';

    const wrapper = document.createElement('div');
    wrapper.className = isAi ? 'msg-ai' : 'msg-user';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    if (isAi && sources.length) {
        const chips = document.createElement('div');
        chips.className = 'chat-sources';
        sources.forEach(s => {
            const a = document.createElement('a');
            a.className = 'chat-source-chip';
            a.textContent = `📍 ${s.name}`;
            a.href = `destination.html?id=${s.id}`;
            chips.appendChild(a);
        });
        bubble.appendChild(chips);
    }

    if (isAi) {
        const avatar = document.createElement('span');
        avatar.className = 'msg-avatar';
        avatar.textContent = '🤖';
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
    } else {
        wrapper.appendChild(bubble);
    }

    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping(show) {
    const el = document.getElementById('chatbot-typing');
    if (el) el.classList.toggle('hidden', !show);
    const messages = document.getElementById('chatbot-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;
}

// Allow Enter key to send
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatbot-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChat();
            }
        });
    }
});
