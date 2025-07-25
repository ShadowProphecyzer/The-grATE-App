// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
// Market page functionality
console.log('[Market] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Market] DOMContentLoaded');
    setupNavigation();
    setGreeting();
    loadMarketProducts();
});

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
                bottom: 60px !important;
                right: 20px !important;
                position: fixed !important;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                transform: scale(0.6); /* Scale down to 60% */
                transform-origin: bottom right;
            }
        `;
        document.head.appendChild(style);
    }
});

// Navigation functionality
function setupNavigation() {
    console.log('[Market] Setting up navigation');
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const text = this.querySelector('span').textContent.trim();
            console.log(`[Market] Navigation clicked: ${text}`);
            switch(text) {
                case 'Home':
                    window.location.href = 'dashboard.html';
                    break;
                case 'Market':
                    // Already on market page
                    break;
                case 'Scan':
                    window.location.href = 'scanner.html';
                    break;
                case 'Products':
                    window.location.href = 'product.html';
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
    console.log('[Market] Setting greeting for user:', username);
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
}

// Load market products
function loadMarketProducts() {
    console.log('[Market] Loading market products');
    const productsContainer = document.getElementById('products-container');
    
    const fakeProducts = [
        {
            id: 1,
            name: "Organic Quinoa",
            price: "$8.99",
            rating: "4.8 ★",
            icon: "fa-seedling",
            badge: "Organic",
            category: "Grains"
        },
        {
            id: 2,
            name: "Fresh Avocados",
            price: "$4.99",
            rating: "4.9 ★",
            icon: "fa-apple-alt",
            badge: "Fresh",
            category: "Fruits"
        },
        {
            id: 3,
            name: "Greek Yogurt",
            price: "$6.49",
            rating: "4.7 ★",
            icon: "fa-cheese",
            badge: "High Protein",
            category: "Dairy"
        },
        {
            id: 4,
            name: "Salmon Fillet",
            price: "$12.99",
            rating: "4.9 ★",
            icon: "fa-fish",
            badge: "Wild Caught",
            category: "Seafood"
        },
        {
            id: 5,
            name: "Spinach Bundle",
            price: "$3.49",
            rating: "4.6 ★",
            icon: "fa-leaf",
            badge: "Local",
            category: "Vegetables"
        },
        {
            id: 6,
            name: "Almond Butter",
            price: "$9.99",
            rating: "4.8 ★",
            icon: "fa-nut",
            badge: "Natural",
            category: "Nuts"
        },
        {
            id: 7,
            name: "Sweet Potatoes",
            price: "$2.99",
            rating: "4.7 ★",
            icon: "fa-carrot",
            badge: "Seasonal",
            category: "Vegetables"
        },
        {
            id: 8,
            name: "Chicken Breast",
            price: "$7.99",
            rating: "4.8 ★",
            icon: "fa-drumstick-bite",
            badge: "Free Range",
            category: "Meat"
        }
    ];
    
    const productsHTML = fakeProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price}</div>
            <div class="product-rating">${product.rating}</div>
        </div>
    `).join('');
    
    productsContainer.innerHTML = productsHTML;
    
    // Add click handlers to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.dataset.productId;
            console.log('[Market] Product clicked:', productId);
            // You can add navigation to product detail page here
            alert('Product details coming soon!');
        });
    });
}

// Logout functionality
function logout() {
    console.log('[Market] Logging out user');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
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