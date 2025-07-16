document.getElementById('sign-in-btn').addEventListener('click', function() {
    // Navigate to account.html and show sign-in form
    window.location.href = 'account.html?mode=signin';
});

document.getElementById('sign-up-btn').addEventListener('click', function() {
    // Navigate to account.html and show sign-up form
    window.location.href = 'account.html?mode=signup';
});

document.getElementById('guest-btn').addEventListener('click', function() {
    // Show a centered, closable popup with error message
    if (document.getElementById('guest-popup')) return;
    const popup = document.createElement('div');
    popup.id = 'guest-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#fff';
    popup.style.border = '2px solid #F26522';
    popup.style.borderRadius = '16px';
    popup.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
    popup.style.padding = '32px 24px 24px 24px';
    popup.style.zIndex = '1000';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.innerHTML = `
        <div style="color:#F26522;font-size:1.2rem;font-weight:600;margin-bottom:12px;text-align:center;">Guest mode is unavailable</div>
        <button id="close-guest-popup" style="margin-top:12px;background:#F26522;color:#fff;border:none;border-radius:8px;padding:8px 24px;font-size:1rem;cursor:pointer;">Close</button>
    `;
    document.body.appendChild(popup);
    document.getElementById('close-guest-popup').onclick = function() {
        popup.remove();
    };
});

document.getElementById('settings-icon').addEventListener('click', function() {
    console.log('Settings icon clicked');
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
