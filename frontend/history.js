// History page functionality
console.log('[History] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[History] DOMContentLoaded');
    setupNavigation();
    setGreeting();
    loadHistory();
    setupModal();
});

// Navigation functionality
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const text = this.querySelector('span').textContent.trim();
            switch(text) {
                case 'Home':
                    window.location.href = 'dashboard.html';
                    break;
                case 'Market':
                    window.location.href = 'market.html';
                    break;
                case 'Scan':
                    window.location.href = 'scanner.html';
                    break;
                case 'Products':
                    window.location.href = 'product.html';
                    break;
                case 'Help':
                    window.location.href = 'help.html';
                    break;
                case 'Logout':
                    logout();
                    break;
            }
        });
    });
}

// Set greeting with username
function setGreeting() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'mainscreen.html';
}

// Load scan history for the user
async function loadHistory() {
    const username = localStorage.getItem('username');
    if (!username) {
        document.getElementById('history-list').innerHTML = '<div style="color:#b30000;">Not signed in.</div>';
        return;
    }
    try {
        const res = await fetch(`/api/user/${encodeURIComponent(username)}/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        renderHistory(data);
    } catch (err) {
        document.getElementById('history-list').innerHTML = '<div style="color:#b30000;">Could not load history.</div>';
    }
}

function renderHistory(history) {
    const list = document.getElementById('history-list');
    if (!history || history.length === 0) {
        list.innerHTML = '<div style="color:#888;">No scan history found.</div>';
        return;
    }
    // Sort newest first
    history.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
    list.innerHTML = '';
    history.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <img class="history-img" src="${entry.image || 'https://via.placeholder.com/60?text=No+Image'}" alt="Scan Image">
            <div class="history-info">
                <div class="history-fda">FDA Code: ${entry.fdaCode || entry.fda_code || 'N/A'}</div>
                <div class="history-status ${entry.status === 'failed' ? 'failed' : ''}">${entry.status ? (entry.status.charAt(0).toUpperCase() + entry.status.slice(1)) : 'Unknown'}</div>
                <div class="history-date">${formatDate(entry.createdAt || entry.timestamp)}</div>
            </div>
        `;
        card.addEventListener('click', () => showModal(entry));
        list.appendChild(card);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString();
}

// Modal logic
function setupModal() {
    const modal = document.getElementById('history-modal');
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
}
function showModal(entry) {
    const modal = document.getElementById('history-modal');
    const details = document.getElementById('modal-details');
    details.innerHTML = `<pre>${JSON.stringify(entry, null, 2)}</pre>`;
    modal.style.display = 'flex';
} 