// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}

// Community page functionality
console.log('[Community] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Community] DOMContentLoaded');
    loadCommunityPosts();
    setGreeting();
    setupNavigation();
    setupCreatePost();
});

// Load community posts
async function loadCommunityPosts() {
    console.log('[Community] Loading community posts...');
    try {
        const response = await fetch('/api/community/posts');
        const data = await response.json();
        console.log('[Community] API response:', data);

        if (response.ok) {
            displayPosts(data.posts || []);
        } else {
            showEmptyState('Error loading posts: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('[Community] Error loading posts:', error);
        showEmptyState('Error loading posts. Please try again.');
    }
}

// Display posts in the feed
function displayPosts(posts) {
    console.log('[Community] Displaying posts:', posts);
    const container = document.getElementById('posts-container');
    
    if (!posts || posts.length === 0) {
        showEmptyState('No posts yet. Be the first to share something!');
        return;
    }

    // Sort posts by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const postsHTML = posts.map(post => createPostCard(post)).join('');
    container.innerHTML = postsHTML;
    
    // Add event listeners to like buttons
    setupLikeButtons();
}

// Create a post card
function createPostCard(post) {
    console.log('[Community] Creating post card:', post);
    const currentUser = localStorage.getItem('username');
    const isLiked = post.likes && post.likes.includes(currentUser);
    const likeClass = isLiked ? 'liked' : '';
    
    return `
        <div class="post-card" data-post-id="${post._id}">
            <div class="post-header">
                <div class="post-avatar">
                    ${post.author.charAt(0).toUpperCase()}
                </div>
                <div class="post-author">${post.author}</div>
                <div class="post-time">${formatDate(post.createdAt)}</div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <div class="post-action like-btn ${likeClass}" data-post-id="${post._id}">
                    <i class="fa fa-heart"></i>
                    <span class="like-count">${post.likes ? post.likes.length : 0}</span>
                </div>
                <div class="post-action">
                    <i class="fa fa-comment"></i>
                    <span>${post.comments ? post.comments.length : 0}</span>
                </div>
                <div class="post-action">
                    <i class="fa fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
    `;
}

// Setup like button functionality
function setupLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const postId = this.dataset.postId;
            const currentUser = localStorage.getItem('username');
            
            if (!currentUser) {
                alert('Please log in to like posts');
                return;
            }
            
            try {
                const response = await fetch(`/api/community/posts/${postId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUser })
                });
                
                if (response.ok) {
                    // Toggle like state
                    this.classList.toggle('liked');
                    const likeCount = this.querySelector('.like-count');
                    const currentCount = parseInt(likeCount.textContent);
                    likeCount.textContent = this.classList.contains('liked') ? currentCount + 1 : currentCount - 1;
                } else {
                    console.error('Failed to like post');
                }
            } catch (error) {
                console.error('Error liking post:', error);
            }
        });
    });
}

// Setup create post functionality
function setupCreatePost() {
    const postInput = document.getElementById('post-input');
    const createPostBtn = document.getElementById('create-post-btn');
    
    // Enable/disable post button based on input
    postInput.addEventListener('input', function() {
        createPostBtn.disabled = !this.value.trim();
    });
    
    // Create post on button click
    createPostBtn.addEventListener('click', async function() {
        const content = postInput.value.trim();
        const currentUser = localStorage.getItem('username');
        
        if (!content) {
            alert('Please enter some content for your post');
            return;
        }
        
        if (!currentUser) {
            alert('Please log in to create posts');
            return;
        }
        
        // Disable button and show loading
        this.disabled = true;
        this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Posting...';
        
        try {
            const response = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    author: currentUser
                })
            });
            
            if (response.ok) {
                // Clear input and reload posts
                postInput.value = '';
                this.disabled = true;
                this.innerHTML = '<i class="fa fa-check"></i> Posted!';
                
                // Reload posts after a short delay
                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = '<i class="fa fa-paper-plane" style="margin-right: 5px;"></i> Post';
                    loadCommunityPosts();
                }, 2000);
            } else {
                const data = await response.json();
                alert('Failed to create post: ' + (data.message || 'Unknown error'));
                this.disabled = false;
                this.innerHTML = '<i class="fa fa-paper-plane" style="margin-right: 5px;"></i> Post';
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
            this.disabled = false;
            this.innerHTML = '<i class="fa fa-paper-plane" style="margin-right: 5px;"></i> Post';
        }
    });
}

// Show empty state
function showEmptyState(message) {
    console.log('[Community] Showing empty state:', message);
    const container = document.getElementById('posts-container');
    container.innerHTML = `
        <div class="empty-community">
            <i class="fa fa-users"></i>
            <h3>Community is Quiet</h3>
            <p>${message}</p>
            <p>Be the first to share your food experience!</p>
        </div>
    `;
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
        return date.toLocaleDateString();
    }
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
                    window.location.href = 'market.html';
                    break;
                case 'Scan':
                    window.location.href = 'scanner.html';
                    break;
                case 'Community':
                    // Already on community page
                    break;
                case 'Logout':
                    localStorage.removeItem('username');
                    window.location.href = 'index.html';
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
        // Add custom CSS for chat bubble
        const style = document.createElement('style');
        style.innerHTML = `
            #Iu25vtQ6ivvPlDF1hx7ih {
                z-index: 9999 !important;
                bottom: 24px !important;
                right: 24px !important;
                position: fixed !important;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                transform: scale(0.8);
                transform-origin: bottom right;
            }
        `;
        document.head.appendChild(style);
    }
}); 