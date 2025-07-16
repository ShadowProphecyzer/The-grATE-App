// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
// Report page functionality
console.log('[Report] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Report] DOMContentLoaded');
    setupNavigation();
    setGreeting();
});

// Navigation functionality
function setupNavigation() {
    console.log('[Report] Setting up navigation');
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const text = this.querySelector('span').textContent.trim();
            console.log(`[Report] Navigation clicked: ${text}`);
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
    console.log('[Report] Setting greeting for user:', username);
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
}

// Logout functionality
function logout() {
    console.log('[Report] Logging out user');
    localStorage.removeItem('username');
    window.location.href = 'mainscreen.html';
}

// Report form submission logic
const reportForm = document.getElementById('report-form');
if (reportForm) {
    const photoInput = document.getElementById('report-photo');
    const statusDiv = document.getElementById('report-status');
    photoInput.addEventListener('change', function() {
        if (photoInput.files.length > 3) {
            statusDiv.textContent = 'You can upload a maximum of 3 images.';
            statusDiv.style.color = '#ff6b6b';
            photoInput.value = '';
        } else {
            statusDiv.textContent = '';
        }
    });
    reportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        statusDiv.textContent = 'Submitting...';
        statusDiv.style.color = '#F26522';
        const formData = new FormData();
        // Add up to 3 images
        for (let i = 0; i < Math.min(photoInput.files.length, 3); i++) {
            formData.append('photos', photoInput.files[i]);
        }
        formData.append('fda', document.getElementById('report-fda').value);
        formData.append('issue', document.getElementById('report-issue').value);
        formData.append('location', document.getElementById('report-location').value);
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                statusDiv.textContent = 'Report submitted successfully!';
                statusDiv.style.color = '#4CAF50';
                reportForm.reset();
            } else {
                statusDiv.textContent = data.message || 'Failed to submit report.';
                statusDiv.style.color = '#ff6b6b';
            }
        } catch (err) {
            statusDiv.textContent = 'Failed to submit report. Please try again.';
            statusDiv.style.color = '#ff6b6b';
        }
    });
}

// Settings panel logic (header icon, fallback)
let settingsCog = document.querySelector('#header-icons .fa-cog');
if (!settingsCog) settingsCog = document.querySelector('.fa-cog');
const settingsPanel = document.querySelector('.settings-panel');
const closeSettingsBtn = document.querySelector('.close-settings-btn');
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