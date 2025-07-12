// Tab switching
const tabQuick = document.getElementById('tab-quick');
const tabFav = document.getElementById('tab-fav');
const quickActions = document.getElementById('quick-actions');

if (tabQuick && tabFav && quickActions) {
    tabQuick.addEventListener('click', function() {
        tabQuick.classList.add('active');
        tabFav.classList.remove('active');
        quickActions.style.display = '';
    });
    tabFav.addEventListener('click', function() {
        tabFav.classList.add('active');
        tabQuick.classList.remove('active');
        quickActions.style.display = 'none';
    });
}

// Enable quick balance
const enableBtn = document.getElementById('enable-balance');
if (enableBtn) {
    enableBtn.addEventListener('click', function() {
        enableBtn.textContent = 'Enabled!';
        enableBtn.disabled = true;
        enableBtn.style.background = '#F26522';
        enableBtn.style.color = '#fff';
    });
}

// Set greeting with username
window.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
});

// Redirect to mainscreen on logout
const logoutBtn = document.querySelector('.nav-item span:nth-child(2)');
if (logoutBtn && logoutBtn.textContent.trim() === 'Logout') {
    logoutBtn.parentElement.addEventListener('click', function() {
        window.location.href = 'mainscreen.html';
    });
}

// Redirect to scanner.html on scan button click
const scanBtn = document.querySelector('.nav-item.scan');
if (scanBtn) {
    scanBtn.addEventListener('click', function() {
        window.location.href = 'scanner.html';
    });
}

// Add functionality for quick action buttons
const actionBtns = document.querySelectorAll('.action-btn');
actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const text = this.querySelector('span').textContent.trim();
        
        switch(text) {
            case 'Photos':
                window.location.href = 'photos.html';
                break;
            case 'Nutribot':
                // TODO: Implement nutribot functionality
                console.log('Nutribot clicked');
                break;
            case 'History':
                // TODO: Implement history functionality
                console.log('History clicked');
                break;
            case 'Report':
                // TODO: Implement report functionality
                console.log('Report clicked');
                break;
        }
    });
}); 