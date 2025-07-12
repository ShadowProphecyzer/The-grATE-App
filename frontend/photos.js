// Photos page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadUserPhotos();
});

async function loadUserPhotos() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            showEmptyState('Please log in to view your photos');
            return;
        }

        const response = await fetch(`/api/user/${encodeURIComponent(username)}/photos`);
        const data = await response.json();

        if (response.ok) {
            displayPhotos(data.photos);
        } else {
            showEmptyState('Error loading photos: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading photos:', error);
        showEmptyState('Error loading photos. Please try again.');
    }
}

function displayPhotos(photos) {
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

// Add navigation functionality
function goToScanner() {
    window.location.href = 'scanner.html';
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
} 