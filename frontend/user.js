// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}

// Set greeting with username and setup navigation on DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
    setupNavigation();
    setupSettingsPanel();
    loadUserProfile();
});

// Navigation functionality (copied from dashboard.js)
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
                case 'Help':
                    window.location.href = 'help.html';
                    break;
                case 'Profile':
                    // Already on profile page
                    break;
                case 'Logout':
                    logout();
                    break;
            }
        });
    });
}

// Logout functionality
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'account.html';
}

// Settings panel logic (copied from dashboard.js)
function setupSettingsPanel() {
    const settingsCog = document.getElementById('settings-cog');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsBtn = document.getElementById('close-settings-panel');
    if (settingsCog && settingsPanel && closeSettingsBtn) {
        settingsCog.addEventListener('click', function() {
            settingsPanel.style.display = 'flex';
        });
        closeSettingsBtn.addEventListener('click', function() {
            settingsPanel.style.display = 'none';
        });
        settingsPanel.addEventListener('click', function(e) {
            if (e.target === settingsPanel) settingsPanel.style.display = 'none';
        });
    }
}

// Load user profile info from localStorage (or backend if available)
function loadUserProfile() {
    // Example: load from localStorage
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    document.getElementById('profile-username').textContent = username || '';
    document.getElementById('profile-email').textContent = email || '';
    // You can add more logic here to load other fields if stored
}

// Save preferences button logic (optional, can be expanded)
document.getElementById('save-preferences-btn').addEventListener('click', function() {
    // Save logic here (e.g., to localStorage or backend)
    alert('Preferences saved!');
});