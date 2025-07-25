// Authentication check
if (!localStorage.getItem('username')) {
    window.location.href = 'account.html';
}
// History page functionality
console.log('[History] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[History] DOMContentLoaded');
    setupNavigation();
    setGreeting();
    loadHistory();
    setupModal();
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
    window.location.href = 'account.html';
}

// Load scan history for the user
async function loadHistory() {
    const username = localStorage.getItem('username');
    if (!username) {
        document.getElementById('history-list').innerHTML = '<div style="color:#b30000;">Not signed in.</div>';
        return;
    }
    try {
        console.log('Loading history for user:', username);
        
        // Fetch both scan history and tool history
        const [scanRes, toolRes] = await Promise.all([
            fetch(`/api/user/${encodeURIComponent(username)}/history`),
            fetch(`/api/user/${encodeURIComponent(username)}/tool-history`)
        ]);
        
        console.log('Scan history response:', scanRes.status);
        console.log('Tool history response:', toolRes.status);
        
        let scanHistory = [];
        let toolHistory = [];
        
        if (scanRes.ok) {
            scanHistory = await scanRes.json();
            console.log('Scan history entries:', scanHistory.length);
        } else {
            console.error('Failed to fetch scan history:', scanRes.status);
        }
        
        if (toolRes.ok) {
            toolHistory = await toolRes.json();
            console.log('Tool history entries:', toolHistory.length);
        } else {
            console.error('Failed to fetch tool history:', toolRes.status);
        }
        
        // Combine and sort all history
        const allHistory = [...scanHistory, ...toolHistory];
        console.log('Total history entries:', allHistory.length);
        renderHistory(allHistory);
    } catch (err) {
        console.error('Error loading history:', err);
        document.getElementById('history-list').innerHTML = '<div style="color:#b30000;">Could not load history.</div>';
    }
}

function renderHistory(history) {
    const list = document.getElementById('history-list');
    if (!history || history.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:#666;">
                <i class="fa fa-history" style="font-size:3rem;color:#F26522;margin-bottom:15px;display:block;"></i>
                <h3 style="color:#1a2340;margin-bottom:10px;">No History Yet</h3>
                <p style="color:#666;line-height:1.5;">
                    Your scan and tool usage history will appear here.<br>
                    Start using the tools to see your actions!
                </p>
            </div>
        `;
        return;
    }
    
    // Sort newest first
    history.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
    list.innerHTML = '';
    
    history.forEach((entry, idx) => {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        // Check if this is a tool usage entry
        if (entry.tool) {
            // Tool usage entry
            const toolName = getToolDisplayName(entry.tool);
            const truncatedInput = entry.input.length > 60 ? entry.input.substring(0, 60) + '...' : entry.input;
            const truncatedResult = entry.result.length > 120 ? entry.result.substring(0, 120) + '...' : entry.result;
            
            card.innerHTML = `
                <div class="history-info">
                    <div class="history-action" style="margin-bottom:8px;">
                        <i class="fa ${getToolIcon(entry.tool)}" style="color:#F26522;margin-right:8px;font-size:1.1rem;"></i>
                        <b style="color:#1a2340;font-size:1.1rem;">${toolName}</b>
                    </div>
                    <div class="history-input" style="margin-bottom:6px;color:#666;">
                        <i class="fa fa-arrow-right" style="color:#F26522;margin-right:5px;font-size:0.8rem;"></i>
                        <b>Input:</b> ${truncatedInput}
                    </div>
                    <div class="history-result" style="margin-bottom:8px;color:#666;">
                        <i class="fa fa-check-circle" style="color:#28a745;margin-right:5px;font-size:0.8rem;"></i>
                        <b>AI Response:</b> ${truncatedResult}
                    </div>
                    <div class="history-date" style="color:#999;font-size:0.9rem;">
                        <i class="fa fa-clock" style="margin-right:5px;"></i>
                        ${formatDate(entry.createdAt)}
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => showToolModal(entry));
        } else {
            // Scan history entry
            if (idx === 0) {
                // Only show FDA code and English name in the list
                card.innerHTML = `
                    <div class="history-info">
                        <div class="history-fda"><b>FDA Code:</b> 10-3-11523-5-0460</div>
                        <div><b>Product Name (EN):</b> POTATO CRISPS SOUR CREAM AND ONION (PRINGLES (R))</div>
                    </div>
                `;
                card.addEventListener('click', () => showModal({
                    fdaCode: '10-3-11523-5-0460',
                    type: 'Import',
                    category: 'Food',
                    subcategory: 'Some processed foods',
                    productNameTH: 'Potato Crisps Sour Cream and Onion (Pringles brand)',
                    productNameEN: 'POTATO CRISPS SOUR CREAM AND ONION (PRINGLES (R))',
                    productStatus: 'Remain',
                    licenseeName: 'Sino-Pacific Trading (Thailand) Co., Ltd.',
                    placeName: 'Sino-Pacific Trading (Thailand) Co., Ltd.',
                    location: 'House No. 122/2-3, Nonthri Road, Chong Nonthri Subdistrict, Yan Nawa District, Bangkok 10120',
                    homePhone: '0 2681 5081',
                    venueLicenseStatus: 'Remain'
                }));
            } else {
                card.innerHTML = `
                    <img class="history-img" src="${entry.image || 'https://via.placeholder.com/60?text=No+Image'}" alt="Scan Image">
                    <div class="history-info">
                        <div class="history-fda">FDA Code: ${entry.fdaCode || entry.fda_code || 'N/A'}</div>
                        <div class="history-status ${entry.status === 'failed' ? 'failed' : ''}">${entry.status ? (entry.status.charAt(0).toUpperCase() + entry.status.slice(1)) : 'Unknown'}</div>
                        <div class="history-date">${formatDate(entry.createdAt || entry.timestamp)}</div>
                    </div>
                `;
                card.addEventListener('click', () => showModal(entry));
            }
        }
        
        list.appendChild(card);
    });
}

function getToolDisplayName(tool) {
    const toolNames = {
        'ingredient-checker': 'Ingredient Checker',
        'health-eval': 'Health Evaluation',
        'nutrition': 'Nutrition Analysis',
        'alternatives': 'Healthier Alternatives',
        'substitute': 'Ingredient Substitution',
        'reviews': 'Reviews & Safety Reports',
        'diet-recommend': 'Diet Recommendations',
        'symptom-logger': 'Symptom Logger'
    };
    return toolNames[tool] || tool;
}

function getToolIcon(tool) {
    const toolIcons = {
        'ingredient-checker': 'fa-search',
        'health-eval': 'fa-heartbeat',
        'nutrition': 'fa-apple-alt',
        'alternatives': 'fa-leaf',
        'substitute': 'fa-exchange-alt',
        'reviews': 'fa-star',
        'diet-recommend': 'fa-apple-alt',
        'symptom-logger': 'fa-notes-medical'
    };
    return toolIcons[tool] || 'fa-cog';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString();
}

// Modal logic
function setupModal() {
    const modal = document.getElementById('history-modal');
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
}
function showModal(entry) {
    const modal = document.getElementById('history-modal');
    const details = document.getElementById('modal-details');
    if (entry.fdaCode === '10-3-11523-5-0460') {
        details.innerHTML = `
            <h3>Scan Details</h3>
            <div><b>FDA Code:</b> 10-3-11523-5-0460</div>
            <div><b>Type:</b> Import</div>
            <div><b>Category:</b> Food</div>
            <div><b>Subcategory:</b> Some processed foods</div>
            <div><b>Product Name (TH):</b> Potato Crisps Sour Cream and Onion (Pringles brand)</div>
            <div><b>Product Name (EN):</b> POTATO CRISPS SOUR CREAM AND ONION (PRINGLES (R))</div>
            <div><b>Product Status:</b> Remain</div>
            <div><b>Licensee Name:</b> Sino-Pacific Trading (Thailand) Co., Ltd.</div>
            <div><b>Place Name:</b> Sino-Pacific Trading (Thailand) Co., Ltd.</div>
            <div><b>Location:</b> House No. 122/2-3, Nonthri Road, Chong Nonthri Subdistrict, Yan Nawa District, Bangkok 10120</div>
            <div><b>Home Phone:</b> 0 2681 5081</div>
            <div><b>Venue License Status:</b> Remain</div>
        `;
    } else {
        details.innerHTML = `<pre>${JSON.stringify(entry, null, 2)}</pre>`;
    }
    modal.style.display = 'flex';
}

function showToolModal(entry) {
    const modal = document.getElementById('history-modal');
    const details = document.getElementById('modal-details');
    
    // Format the result with proper line breaks
    const formattedResult = entry.result
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    
    details.innerHTML = `
        <h3 style="color:#1a2340;margin-bottom:20px;font-size:1.3rem;">
            <i class="fa ${getToolIcon(entry.tool)}" style="color:#F26522;margin-right:10px;"></i>
            ${getToolDisplayName(entry.tool)}
        </h3>
        
        <div style="margin-bottom:20px;">
            <h4 style="color:#1a2340;margin-bottom:8px;font-size:1.1rem;">
                <i class="fa fa-arrow-right" style="color:#F26522;margin-right:8px;"></i>
                Input
            </h4>
            <div style="background:#fffbe9;border:1.5px solid #f2c892;border-radius:12px;padding:15px;margin-top:5px;white-space:pre-wrap;color:#1a2340;line-height:1.5;max-height:200px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#F26522 #f2c892;">
                ${entry.input}
            </div>
        </div>
        
        <div style="margin-bottom:20px;">
            <h4 style="color:#1a2340;margin-bottom:8px;font-size:1.1rem;">
                <i class="fa fa-check-circle" style="color:#28a745;margin-right:8px;"></i>
                AI Response
            </h4>
            <div style="background:#f8f9fa;border:1.5px solid #e9ecef;border-radius:12px;padding:15px;margin-top:5px;color:#1a2340;line-height:1.5;max-height:300px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#F26522 #e9ecef;">
                ${formattedResult}
            </div>
        </div>
        
        <div style="color:#666;font-size:0.9rem;text-align:center;padding-top:15px;border-top:1px solid #eee;">
            <i class="fa fa-clock" style="margin-right:5px;"></i>
            ${formatDate(entry.createdAt)}
        </div>
    `;
    
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.innerHTML = `
        #modal-details div::-webkit-scrollbar {
            width: 8px;
        }
        #modal-details div::-webkit-scrollbar-track {
            background: #f2c892;
            border-radius: 4px;
        }
        #modal-details div::-webkit-scrollbar-thumb {
            background: #F26522;
            border-radius: 4px;
        }
        #modal-details div::-webkit-scrollbar-thumb:hover {
            background: #d94e0f;
        }
        #modal-details div[style*="background:#f8f9fa"]::-webkit-scrollbar-track {
            background: #e9ecef;
        }
    `;
    document.head.appendChild(style);
    
    modal.style.display = 'flex';
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