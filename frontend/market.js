// Market page functionality
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setGreeting();
});

// Navigation functionality
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
                    // Already on market page
                    break;
                case 'Scan':
                    window.location.href = 'scanner.html';
                    break;
                case 'Products':
                    window.location.href = 'product.html';
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
    window.location.href = 'mainscreen.html';
} 