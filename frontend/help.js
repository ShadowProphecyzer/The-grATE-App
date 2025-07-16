// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
// Help page functionality
console.log('[Help] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Help] DOMContentLoaded');
    setupNavigation();
    setGreeting();
});

// Navigation functionality
function setupNavigation() {
    console.log('[Help] Setting up navigation');
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const text = this.querySelector('span').textContent.trim();
            console.log(`[Help] Navigation clicked: ${text}`);
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
                    // Already on help page
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
    console.log('[Help] Setting greeting for user:', username);
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
}

// Logout functionality
function logout() {
    console.log('[Help] Logging out user');
    localStorage.removeItem('username');
    window.location.href = 'mainscreen.html';
}

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    let cooldown = false;
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (cooldown) return;
        const statusDiv = document.getElementById('contact-status');
        statusDiv.textContent = 'Sending...';
        statusDiv.style.color = '#F26522';
        // Get username and email from localStorage only
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        console.log('Help form: username/email from localStorage:', username, email);
        if (!username || !email) {
            statusDiv.textContent = 'You must be signed in with a valid email to submit a help request.';
            statusDiv.style.color = '#ff6b6b';
            return;
        }
        // Only get problem and description from the form
        const formData = {
            username,
            email,
            problem: document.getElementById('contact-problem').value,
            description: document.getElementById('contact-message').value
        };
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                statusDiv.textContent = 'Message sent! We will get back to you soon.';
                statusDiv.style.color = '#4CAF50';
                contactForm.reset();
                cooldown = true;
                setTimeout(() => { cooldown = false; statusDiv.textContent = ''; }, 5000);
            } else {
                statusDiv.textContent = data.message || 'Failed to send message.';
                statusDiv.style.color = '#ff6b6b';
            }
        } catch (err) {
            statusDiv.textContent = 'Failed to send message. Please try again.';
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