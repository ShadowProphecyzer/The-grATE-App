// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
// Product page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadUserProducts();
    setupNavigation();
    setGreeting();
});

async function loadUserProducts() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            showEmptyState('Please log in to view your products');
            return;
        }

        const response = await fetch(`/api/user/${encodeURIComponent(username)}/products`);
        const data = await response.json();

        if (response.ok) {
            displayProducts(data.products);
        } else {
            showEmptyState('Error loading products: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState('Error loading products. Please try again.');
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (!products || products.length === 0) {
        showEmptyState('No products yet. Start scanning to capture your first product!');
        return;
    }

    const productsGrid = document.createElement('div');
    productsGrid.className = 'products-grid';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    container.innerHTML = '';
    container.appendChild(productsGrid);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.imageBase64 || product.imageUrl;
    image.alt = product.name || 'Scanned product';
    image.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjI2NTIyIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
    };

    const info = document.createElement('div');
    info.className = 'product-info';

    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = product.name || 'Scanned Product';

    const date = document.createElement('div');
    date.className = 'product-date';
    const scanDate = new Date(product.scannedAt || product.uploadedAt);
    date.textContent = scanDate.toLocaleDateString() + ' ' + scanDate.toLocaleTimeString();

    const source = document.createElement('div');
    source.className = 'product-source';
    source.textContent = product.source || 'scanner';

    info.appendChild(title);
    info.appendChild(date);
    info.appendChild(source);

    card.appendChild(image);
    card.appendChild(info);

    // Add click handler to view product details
    card.addEventListener('click', () => {
        viewProductDetails(product);
    });

    return card;
}

function viewProductDetails(product) {
    // Store product data for detail view
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    // Navigate to product detail page (you can create this later)
    // window.location.href = 'product-detail.html';
    console.log('Viewing product:', product);
}

function showEmptyState(message) {
    const container = document.getElementById('products-container');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fa fa-box"></i>
            <h3>No Products Yet</h3>
            <p>${message}</p>
            <a href="scanner.html" class="scan-btn">
                <i class="fa fa-qrcode"></i> Start Scanning
            </a>
        </div>
    `;
}

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
                    window.location.href = 'dashboard.html';
                    break;
                case 'Market':
                    window.location.href = 'market.html';
                    break;
                case 'Scan':
                    window.location.href = 'scanner.html';
                    break;
                case 'Products':
                    // Already on products page
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

// Set greeting with username
function setGreeting() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('selectedProduct');
    window.location.href = 'mainscreen.html';
}

// Add navigation functions
function goToScanner() {
    window.location.href = 'scanner.html';
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function goToMarket() {
    window.location.href = 'market.html';
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