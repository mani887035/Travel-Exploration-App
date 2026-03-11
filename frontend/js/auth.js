/* auth.js — Login, Register, OAuth handling */

function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
    hideAlert();
}

function showAlert(msg, type = 'error') {
    const el = document.getElementById('auth-alert');
    el.textContent = msg;
    el.className = `auth-alert ${type}`;
}
function hideAlert() {
    document.getElementById('auth-alert').className = 'auth-alert hidden';
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    btn.querySelector('.btn-text').classList.toggle('hidden', loading);
    btn.querySelector('.btn-spinner').classList.toggle('hidden', !loading);
    btn.disabled = loading;
}

// ── Redirect if already logged in ─────────────
if (api.isLoggedIn()) window.location.href = 'home.html';

// Handle token from OAuth redirect (query param)
const urlParams = new URLSearchParams(window.location.search);
const oauthToken = urlParams.get('token');
if (oauthToken) {
    // Backend sets query param after OAuth success
    localStorage.setItem('accessToken', oauthToken);
    fetch('http://localhost:8080/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + oauthToken }
    }).then(r => r.json()).then(user => {
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'home.html';
    });
}

// ── Login ──────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    hideAlert();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    setLoading('login-btn', true);
    try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            showAlert('Invalid email or password. Please try again.');
            return;
        }
        const data = await res.json();
        api.saveAuth(data);
        window.location.href = 'home.html';
    } catch (err) {
        showAlert('Cannot connect to server. Is the backend running?');
    } finally {
        setLoading('login-btn', false);
    }
}

// ── Register ───────────────────────────────────
async function handleRegister(e) {
    e.preventDefault();
    hideAlert();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (password !== confirm) { showAlert('Passwords do not match.'); return; }
    if (password.length < 6) { showAlert('Password must be at least 6 characters.'); return; }

    setLoading('register-btn', true);
    try {
        const res = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        if (res.status === 400) {
            const err = await res.json();
            showAlert(err.error || 'Registration failed.');
            return;
        }
        if (!res.ok) { showAlert('Registration failed. Please try again.'); return; }
        const data = await res.json();
        api.saveAuth(data);
        window.location.href = 'home.html';
    } catch (err) {
        showAlert('Cannot connect to server. Is the backend running?');
    } finally {
        setLoading('register-btn', false);
    }
}

// ── Password Strength ─────────────────────────
function updateStrength(pw) {
    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
        { pct: '20%', color: '#EF4444', text: 'Very Weak' },
        { pct: '40%', color: '#F97316', text: 'Weak' },
        { pct: '60%', color: '#EAB308', text: 'Fair' },
        { pct: '80%', color: '#22C55E', text: 'Strong' },
        { pct: '100%', color: '#14B8A6', text: 'Very Strong' },
    ];
    const lvl = levels[Math.min(score - 1, 4)] || { pct: '0%', color: 'transparent', text: '' };
    fill.style.width = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent = score > 0 ? lvl.text : '';
    label.style.color = lvl.color;
}

// ── Toggle Password Visibility ─────────────────
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
}
