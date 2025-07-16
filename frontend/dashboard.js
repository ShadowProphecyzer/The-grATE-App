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
            case 'Community':
                window.location.href = 'community.html';
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

// Attach logout to new header icon
window.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Revert Chatbase chat bubble CSS to fixed position, bottom right, scale 0.35, outside nav bar
window.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    const chatHash = localStorage.getItem('chatHash');
    if (username && chatHash) {
        (function(){
            if(!window.chatbase||window.chatbase("getState")!=="initialized"){
                window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};
                window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})
            }
            const onLoad=function(){
                const script=document.createElement("script");
                script.src="https://www.chatbase.co/embed.min.js";
                script.id="Iu25vtQ6ivvPlDF1hx7ih";
                script.domain="www.chatbase.co";
                document.body.appendChild(script)
            };
            if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}
        })();
        // Optionally, pass user info to Chatbase if supported
        // window.chatbase('setUser', { id: username, hash: chatHash });
        // Add custom CSS for chat bubble (fixed, bottom right)
        const style = document.createElement('style');
        style.innerHTML = `
            #Iu25vtQ6ivvPlDF1hx7ih {
                z-index: 9999 !important;
                position: fixed !important;
                right: 0px !important;
                bottom: 0px !important;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                transform: scale(0.35); /* Scale down to 35% */
                transform-origin: bottom right;
            }
        `;
        document.head.appendChild(style);
    }
}); 