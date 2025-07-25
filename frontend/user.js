// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}

// Set greeting with username and setup navigation on DOMContentLoaded
window.addEventListener('DOMContentLoaded', async function() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
    setupNavigation();
    setupSettingsPanel();
    await loadUserProfile();
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

// Load user profile info from localStorage and backend
async function loadUserProfile() {
    let profile = JSON.parse(localStorage.getItem('profile') || '{}');
    
    // If profile is empty, try to fetch from backend
    if (!profile || Object.keys(profile).length === 0) {
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const response = await fetch(`/api/user/${encodeURIComponent(username)}/preferences`);
                if (response.ok) {
                    profile = await response.json();
                    // Store in localStorage for future use
                    localStorage.setItem('profile', JSON.stringify(profile));
                }
            } catch (err) {
                console.log('Could not fetch profile from backend');
            }
        }
    }
    
    // Populate form fields
    document.getElementById('profile-username').textContent = localStorage.getItem('username') || profile.username || '';
    document.getElementById('profile-email').textContent = localStorage.getItem('email') || profile.email || '';
    document.getElementById('profile-age').value = profile.age || '';
    document.getElementById('profile-height').value = profile.height || '';
    document.getElementById('profile-weight').value = profile.weight || '';
    document.getElementById('profile-allergies').value = profile.allergies || '';
    document.getElementById('profile-dietary').value = profile.dietary || '';
    document.getElementById('profile-likes').value = profile.likes || '';
    document.getElementById('profile-dislikes').value = profile.dislikes || '';
    document.getElementById('profile-goals').value = profile.goals || '';
}

// Save preferences button logic (saves to both localStorage and backend)
document.getElementById('save-preferences-btn').addEventListener('click', async function() {
    const saveBtn = this;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    const profile = {
        username: localStorage.getItem('username') || '',
        email: localStorage.getItem('email') || document.getElementById('profile-email').textContent,
        age: document.getElementById('profile-age').value,
        height: document.getElementById('profile-height').value,
        weight: document.getElementById('profile-weight').value,
        allergies: document.getElementById('profile-allergies').value,
        dietary: document.getElementById('profile-dietary').value,
        likes: document.getElementById('profile-likes').value,
        dislikes: document.getElementById('profile-dislikes').value,
        goals: document.getElementById('profile-goals').value
    };
    
    try {
        // Save to localStorage first
        localStorage.setItem('profile', JSON.stringify(profile));
        
        // Save to backend
        const response = await fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });
        
        if (response.ok) {
            saveBtn.textContent = 'Saved!';
            saveBtn.style.background = '#28a745';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '#F26522';
                saveBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error('Failed to save to backend');
        }
    } catch (error) {
        console.error('Error saving preferences:', error);
        saveBtn.textContent = 'Error - Try Again';
        saveBtn.style.background = '#dc3545';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#F26522';
            saveBtn.disabled = false;
        }, 3000);
    }
});