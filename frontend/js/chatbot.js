/* chatbot.js — AI Travel Chatbot Widget */

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
    // Hide suggestions after first use
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.style.display = 'none';
    sendChat();
}

async function sendChat() {
    const input = document.getElementById('chatbot-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    appendMessage(question, 'user');
    showTyping(true);

    // Hide suggestions after first message
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.style.display = 'none';

    try {
        const res = await api.fetch('/chat', {
            method: 'POST',
            body: JSON.stringify({ question })
        });

        showTyping(false);

        if (!res.ok) {
            appendMessage('Sorry, I had trouble connecting. Please try again! 🙏', 'ai');
            return;
        }

        const data = await res.json();
        appendMessage(data.answer, 'ai', data.sources || []);

    } catch (e) {
        showTyping(false);
        appendMessage('I\'m having trouble connecting right now. Please ensure the backend is running! 🙏', 'ai');
    }
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
