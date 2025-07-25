document.getElementById('symptom-logger-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Symptom logger form submitted');
    
    const input = document.getElementById('symptom-logger-input').value.trim();
    const resultDiv = document.getElementById('symptom-logger-result');
    
    console.log('Input value:', input);
    
    if (!input) {
        console.log('No input provided');
        resultDiv.innerHTML = '<span style="color:#F26522;">Please describe your symptoms and foods eaten.</span>';
        return;
    }
    
    console.log('Starting symptom logging...');
    resultDiv.innerHTML = '<div style="text-align:center;"><i class="fa fa-spinner fa-spin" style="color:#F26522;font-size:1.2rem;"></i><br><span style="color:#F26522;font-weight:bold;">Logging symptom...</span></div>';
    
    // Get user profile details from localStorage
    let profile = {};
    try {
        profile = JSON.parse(localStorage.getItem('profile') || '{}');
        console.log('Profile from localStorage:', profile);
        
        // If profile is empty, try to fetch from backend
        if (!profile || Object.keys(profile).length === 0) {
            const username = localStorage.getItem('username');
            console.log('Username:', username);
            if (username) {
                try {
                    const response = await fetch(`/api/user/${encodeURIComponent(username)}/preferences`);
                    if (response.ok) {
                        profile = await response.json();
                        localStorage.setItem('profile', JSON.stringify(profile));
                        console.log('Profile fetched from backend:', profile);
                    }
                } catch (err) {
                    console.log('Could not fetch profile from backend:', err);
                }
            }
        }
    } catch (e) {
        console.log('Error parsing profile:', e);
        profile = {};
    }
    
    console.log('Sending request to backend with:', { symptoms: input, profile });
    
    try {
        const response = await fetch('/api/symptom-logger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                symptoms: input, 
                profile: profile 
            })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.result) {
            const formattedResult = data.result
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');
            
            resultDiv.innerHTML = `
                <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:12px;max-height:350px;overflow-y:auto;">
                    <h4 style="margin:0 0 8px 0;color:#1a2340;font-size:1.1rem;">
                        <i class="fa fa-notes-medical" style="color:#28a745;margin-right:8px;"></i>
                        Symptom Logged
                    </h4>
                    <div style="color:#1a2340;line-height:1.5;font-size:1rem;">
                        ${formattedResult}
                    </div>
                </div>
            `;
            
            // Save tool usage
            const username = localStorage.getItem('username');
            console.log('Saving tool usage for username:', username);
            if (username) {
                try {
                    const saveResponse = await fetch(`/api/user/${encodeURIComponent(username)}/tool-history`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ 
                            tool: 'symptom-logger', 
                            input, 
                            result: data.result 
                        })
                    });
                    console.log('Save tool history response:', saveResponse.status);
                    if (saveResponse.ok) {
                        const saveResult = await saveResponse.json();
                        console.log('Tool history saved:', saveResult);
                    } else {
                        console.error('Failed to save tool history:', saveResponse.status);
                    }
                } catch (err) {
                    console.error('Could not save tool history:', err);
                }
            } else {
                console.log('No username found in localStorage');
            }
        } else {
            console.log('No result in response, showing error');
            resultDiv.innerHTML = `
                <div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:12px;padding:16px;">
                    <i class="fa fa-exclamation-triangle" style="color:#856404;margin-right:8px;"></i>
                    <span style="color:#856404;">${data.error || 'No result from server. Please try again.'}</span>
                </div>
            `;
        }
    } catch (err) {
        console.error('Error in fetch:', err);
        resultDiv.innerHTML = `
            <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:12px;padding:16px;">
                <i class="fa fa-times-circle" style="color:#721c24;margin-right:8px;"></i>
                <span style="color:#721c24;">Error logging symptom. Please try again later.</span>
            </div>
        `;
    }
});

// Bottom nav bar handler
function setupBottomNav() {
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
                case 'Help':
                    window.location.href = 'help.html';
                    break;
                case 'Logout':
                    window.location.href = 'index.html';
                    break;
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', setupBottomNav); 