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
    window.location.href = 'account.html';
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
    const profileSection = document.getElementById('profile-section');
    const allToolsSection = document.getElementById('all-tools-section');
    if (section === 'favourites') {
        quickActionsSection && (quickActionsSection.style.display = '');
        recipesCardSection && (recipesCardSection.style.display = '');
        profileSection && (profileSection.style.display = 'none');
        allToolsSection && (allToolsSection.style.display = 'none');
    } else if (section === 'profile') {
        quickActionsSection && (quickActionsSection.style.display = 'none');
        recipesCardSection && (recipesCardSection.style.display = 'none');
        profileSection && (profileSection.style.display = '');
        allToolsSection && (allToolsSection.style.display = 'none');
        renderNutritionRadar();
    } else {
        quickActionsSection && (quickActionsSection.style.display = 'none');
        recipesCardSection && (recipesCardSection.style.display = 'none');
        profileSection && (profileSection.style.display = 'none');
        allToolsSection && (allToolsSection.style.display = '');
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
        } else if (idx === 0) {
            showSection('profile');
        } else {
            showSection('placeholder');
        }
    });
});
// Show only Favourites by default
showSection('favourites');

// Global variable for nutrition values, can be set by other files
window.nutritionValues = window.nutritionValues || [65, 59, 90, 81, 56, 55, 40]; // Carbs, Vitamins, Minerals, Fibres, Water, Fats, Proteins

function renderNutritionRadar() {
    if (!window.Chart) return;
    const ctx = document.getElementById('nutrition-radar').getContext('2d');
    // Destroy previous chart if exists
    if (window.nutritionRadarChart) {
        window.nutritionRadarChart.destroy();
    }
    window.nutritionRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Carbohydrates', 'Vitamins', 'Minerals', 'Fibres', 'Water', 'Fats', 'Proteins'],
            datasets: [{
                label: 'Your Intake',
                data: window.nutritionValues,
                fill: true,
                backgroundColor: 'rgba(242,101,34,0.2)',
                borderColor: 'rgba(242,101,34,1)',
                pointBackgroundColor: 'rgba(242,101,34,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(242,101,34,1)'
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    pointLabels: {
                        color: function(context) {
                            // Color based on value consumed
                            const value = window.nutritionValues?.[context.index] ?? 0;
                            if (value < 40) return '#e53935'; // red
                            if (value < 70) return '#FFC107'; // orange
                            return '#43A047'; // green
                        },
                        font: { size: 16 }
                    },
                    ticks: {
                        color: '#333',
                        stepSize: 20,
                        backdropColor: 'rgba(0,0,0,0)',
                        callback: function(value) {
                            return value % 20 === 0 ? value : '';
                        }
                    }
                }
            }
        }
    });
}

// Add note below the radar plot
const profileSection = document.getElementById('profile-section');
if (profileSection && !document.getElementById('nutrition-note')) {
    const note = document.createElement('div');
    note.id = 'nutrition-note';
    note.style.fontSize = '0.85em';
    note.style.color = '#666';
    note.style.marginTop = '10px';
    note.textContent = 'Note: 100 represents full and appropriate consumption.';
    profileSection.appendChild(note);
}

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