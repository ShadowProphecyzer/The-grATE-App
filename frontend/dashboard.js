// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
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
    
    // Setup navigation functionality
    setupNavigation();
});

// Navigation functionality
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle navigation based on text content
            const text = this.querySelector('span').textContent.trim();
            
            switch(text) {
                case 'Home':
                    // Already on home page
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
    window.location.href = 'mainscreen.html';
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
                window.location.href = 'nutribot.html';
                break;
            case 'History':
                window.location.href = 'history.html';
                break;
            case 'Report':
                window.location.href = 'report.html';
                break;
        }
    });
}); 

// 3-menu navigation logic
const menuItems = document.querySelectorAll('.three-menu-nav .menu-item');
const menuUnderline = document.querySelector('.three-menu-nav .menu-underline');
const quickActionsSection = document.getElementById('quick-actions');
const recipesCardSection = document.getElementById('recipes-card');
function showSection(section) {
    // Promo card always visible
    if (section === 'favourites') {
        quickActionsSection && (quickActionsSection.style.display = '');
        recipesCardSection && (recipesCardSection.style.display = '');
    } else {
        quickActionsSection && (quickActionsSection.style.display = 'none');
        recipesCardSection && (recipesCardSection.style.display = 'none');
    }
}

menuItems.forEach((item, idx) => {
    item.addEventListener('click', function() {
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        // Move underline
        if (menuUnderline) {
            menuUnderline.style.left = (idx * 33.33) + '%';
        }
        // Show/hide content
        if (idx === 1) {
            showSection('favourites');
        } else {
            showSection('placeholder');
        }
    });
});
// Show only Favourites by default
showSection('favourites'); 

// Settings panel logic
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