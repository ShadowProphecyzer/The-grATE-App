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
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const statusDiv = document.getElementById('contact-status');
        statusDiv.textContent = 'Sending...';
        statusDiv.style.color = '#F26522';
        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            message: document.getElementById('contact-message').value
        };
        console.log('[Help] Submitting contact form:', formData);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                console.log('[Help] Contact form submitted successfully:', data);
                statusDiv.textContent = 'Message sent! We will get back to you soon.';
                statusDiv.style.color = '#4CAF50';
                contactForm.reset();
            } else {
                console.error('[Help] Contact form error:', data.message);
                statusDiv.textContent = data.message || 'Failed to send message.';
                statusDiv.style.color = '#ff6b6b';
            }
        } catch (err) {
            console.error('[Help] Contact form fetch error:', err);
            statusDiv.textContent = 'Failed to send message. Please try again.';
            statusDiv.style.color = '#ff6b6b';
        }
    });
} 