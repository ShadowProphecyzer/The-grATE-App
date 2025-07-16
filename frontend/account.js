function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// Username validation function (matches backend validation)
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// Password validation function (matches backend validation)
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return minLength && hasCapital && hasNumber;
}

// Get password strength and requirements status
function getPasswordStatus(password) {
    const minLength = password.length >= 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
        minLength,
        hasCapital,
        hasNumber,
        isValid: minLength && hasCapital && hasNumber
    };
}

window.addEventListener('DOMContentLoaded', function() {
    const mode = getQueryParam('mode');
    if (mode === 'signup') {
        document.getElementById('toggle-signup').click();
    } else {
        document.getElementById('toggle-signin').click();
    }

    // Add real-time username validation
    const usernameInput = document.getElementById('signup-username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            const username = this.value;
            const messageDiv = document.getElementById('form-message');
            
            if (username.length > 0) {
                if (!validateUsername(username)) {
                    messageDiv.style.color = '#d94e0f';
                    messageDiv.textContent = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.';
                } else {
                    messageDiv.style.color = '#2e7d32';
                    messageDiv.textContent = 'Username format is valid.';
                }
            } else {
                messageDiv.textContent = '';
            }
        });
    }

    // Add real-time password validation
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const messageDiv = document.getElementById('form-message');
            
            if (password.length > 0) {
                const status = getPasswordStatus(password);
                let message = 'Password requirements: ';
                let requirements = [];
                
                if (!status.minLength) requirements.push('at least 8 characters');
                if (!status.hasCapital) requirements.push('one capital letter');
                if (!status.hasNumber) requirements.push('one number');
                
                if (requirements.length > 0) {
                    messageDiv.style.color = '#d94e0f';
                    messageDiv.textContent = message + requirements.join(', ') + '.';
                } else {
                    messageDiv.style.color = '#2e7d32';
                    messageDiv.textContent = 'Password meets all requirements.';
                }
            } else {
                messageDiv.textContent = '';
            }
        });
    }
});

document.getElementById('toggle-signin').addEventListener('click', function() {
    document.getElementById('signin-form').style.display = '';
    document.getElementById('signup-form').style.display = 'none';
    this.classList.add('active');
    document.getElementById('toggle-signup').classList.remove('active');
    document.getElementById('form-message').textContent = '';
});

document.getElementById('toggle-signup').addEventListener('click', function() {
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('signup-form').style.display = '';
    this.classList.add('active');
    document.getElementById('toggle-signin').classList.remove('active');
    document.getElementById('form-message').textContent = '';
});

document.getElementById('signin-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const messageDiv = document.getElementById('form-message');
    try {
        const res = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            messageDiv.style.color = '#2e7d32';
            messageDiv.textContent = 'Sign-in successful! Redirecting...';
            if (data.username) {
                localStorage.setItem('username', data.username);
                localStorage.setItem('email', email);
                console.log('Set username and email in localStorage:', data.username, email);
            }
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 1200);
        } else {
            messageDiv.style.color = '#d94e0f';
            messageDiv.textContent = data.message || 'Sign-in failed.';
        }
    } catch (err) {
        messageDiv.style.color = '#d94e0f';
        messageDiv.textContent = 'Network error.';
    }
});

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const messageDiv = document.getElementById('form-message');
    
    // Client-side validation
    if (!validateUsername(username)) {
        messageDiv.style.color = '#d94e0f';
        messageDiv.textContent = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.';
        return;
    }
    
    if (!validatePassword(password)) {
        messageDiv.style.color = '#d94e0f';
        messageDiv.textContent = 'Password must be at least 8 characters long and contain at least one capital letter and one number.';
        return;
    }
    
    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            messageDiv.style.color = '#2e7d32';
            messageDiv.textContent = 'Sign-up successful! Please sign in.';
            // Store email in localStorage for immediate use
            localStorage.setItem('email', email);
            setTimeout(() => {
                document.getElementById('toggle-signin').click();
            }, 1200);
        } else {
            messageDiv.style.color = '#d94e0f';
            messageDiv.textContent = data.message || 'Sign-up failed.';
        }
    } catch (err) {
        messageDiv.style.color = '#d94e0f';
        messageDiv.textContent = 'Network error.';
    }
});

document.getElementById('return-main-link').addEventListener('click', function() {
    window.location.href = 'mainscreen.html';
});

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
