// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
// Photos page functionality
console.log('[Photos] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Photos] DOMContentLoaded');
    loadUserPhotos();
    setGreeting();
    setupNavigation();
});

async function loadUserPhotos() {
    console.log('[Photos] Loading user photos...');
    try {
        const username = localStorage.getItem('username');
        console.log('[Photos] Username:', username);
        if (!username) {
            showEmptyState('Please log in to view your photos');
            return;
        }

        const response = await fetch(`/api/user/${encodeURIComponent(username)}/photos`);
        const data = await response.json();
        console.log('[Photos] API response:', data);

        if (response.ok) {
            displayPhotos(data.photos);
        } else {
            showEmptyState('Error loading photos: ' + data.message);
        }
    } catch (error) {
        console.error('[Photos] Error loading photos:', error);
        showEmptyState('Error loading photos. Please try again.');
    }
}

function displayPhotos(photos) {
    console.log('[Photos] Displaying photos:', photos);
    const container = document.getElementById('photos-container');
    
    if (!photos || photos.length === 0) {
        showEmptyState('No photos yet. Start scanning to capture your first photo!');
        return;
    }

    const photosGrid = document.createElement('div');
    photosGrid.className = 'photos-grid';

    photos.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        photosGrid.appendChild(photoCard);
    });

    container.innerHTML = '';
    container.appendChild(photosGrid);
}

function createPhotoCard(photo) {
    console.log('[Photos] Creating photo card:', photo);
    const card = document.createElement('div');
    card.className = 'photo-card';

    const image = document.createElement('img');
    image.className = 'photo-image';
    image.src = photo.imageBase64;
    image.alt = photo.filename || 'Scanned photo';
    image.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjI2NTIyIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UGhvdG8gTm90IEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
    };

    const info = document.createElement('div');
    info.className = 'photo-info';

    const title = document.createElement('div');
    title.className = 'photo-title';
    title.textContent = photo.filename || 'Scanned Photo';

    const date = document.createElement('div');
    date.className = 'photo-date';
    const uploadDate = new Date(photo.uploadedAt);
    date.textContent = uploadDate.toLocaleDateString() + ' ' + uploadDate.toLocaleTimeString();

    const source = document.createElement('div');
    source.className = 'photo-source';
    source.textContent = photo.source || 'scanner';

    info.appendChild(title);
    info.appendChild(date);
    info.appendChild(source);

    card.appendChild(image);
    card.appendChild(info);

    return card;
}

function showEmptyState(message) {
    console.log('[Photos] Showing empty state:', message);
    const container = document.getElementById('photos-container');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fa fa-camera"></i>
            <h3>No Photos Yet</h3>
            <p>${message}</p>
            <a href="scanner.html" class="scan-btn">
                <i class="fa fa-camera"></i> Start Scanning
            </a>
        </div>
    `;
}

function setGreeting() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
}

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
                case 'Photos':
                    // Already on photos page
                    break;
                case 'Help':
                    window.location.href = 'help.html';
                    break;
                case 'Logout':
                    localStorage.removeItem('username');
                    window.location.href = 'mainscreen.html';
                    break;
            }
        });
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

// Inject Chatbase chat bubble if user is logged in
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
        // Add custom CSS for chat bubble
        const style = document.createElement('style');
        style.innerHTML = `
            #Iu25vtQ6ivvPlDF1hx7ih {
                z-index: 9999 !important;
                bottom: 24px !important;
                right: 24px !important;
                position: fixed !important;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                transform: scale(0.8); /* Scale down to 80% */
                transform-origin: bottom right;
            }
        `;
        document.head.appendChild(style);
    }
}); 