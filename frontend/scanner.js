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
});

// Navigation functionality
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
            case 'Flashlight':
                toggleFlashlight();
                break;
            case 'Scan':
                // Already on scan page
                break;
            case 'Flip Camera':
                flipCamera();
                break;
            case 'Logout':
                window.location.href = 'mainscreen.html';
                break;
        }
    });
});

// QR Scanner functionality
let videoStream = null;
let scanning = false;
let currentFacingMode = 'environment'; // Start with back camera
let flashlightOn = false; // Track flashlight state

function initializeScanner() {
    console.log('Scanner initialized');
    startCamera();
}

async function startCamera() {
    try {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
        
        const constraints = {
            video: {
                facingMode: currentFacingMode, // Use current camera mode
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('qr-video');
        video.srcObject = videoStream;
        
        // Start scanning after video loads
        video.addEventListener('loadedmetadata', () => {
            startQRScanning();
        });
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        document.querySelector('.scanner-text').textContent = 'Camera access denied';
    }
}

// Flashlight functionality
async function toggleFlashlight() {
    console.log('Toggling flashlight');
    
    if (!videoStream) {
        console.log('No camera stream available');
        return;
    }
    
    try {
        const videoTrack = videoStream.getVideoTracks()[0];
        if (!videoTrack) {
            throw new Error('No video track available');
        }
        
        // Check if device supports torch
        const capabilities = videoTrack.getCapabilities();
        if (!capabilities.torch) {
            throw new Error('Flashlight not supported on this device');
        }
        
        // Toggle flashlight
        flashlightOn = !flashlightOn;
        
        await videoTrack.applyConstraints({
            advanced: [{ torch: flashlightOn }]
        });
        
        // Update flashlight icon
        const flashlightBtn = document.querySelector('.nav-item span');
        if (flashlightBtn && flashlightBtn.textContent.trim() === 'Flashlight') {
            const icon = flashlightBtn.parentElement.querySelector('i');
            if (flashlightOn) {
                icon.classList.remove('fa-lightbulb');
                icon.classList.add('fa-lightbulb-o');
            } else {
                icon.classList.remove('fa-lightbulb-o');
                icon.classList.add('fa-lightbulb');
            }
        }
        
        // Show status message
        const statusText = flashlightOn ? 'Flashlight ON' : 'Flashlight OFF';
        document.querySelector('.scanner-text').textContent = statusText;
        document.querySelector('.scanner-text').style.color = flashlightOn ? '#4CAF50' : '#fff';
        
        // Reset status after 2 seconds
        setTimeout(() => {
            if (document.querySelector('.scanner-text').textContent === statusText) {
                document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
                document.querySelector('.scanner-text').style.color = '#fff';
            }
        }, 2000);
        
    } catch (error) {
        console.error('Flashlight toggle failed:', error);
        
        // Show error message
        document.querySelector('.scanner-text').textContent = 'Flashlight not available on this device';
        document.querySelector('.scanner-text').style.color = '#ff6b6b';
        
        // Reset message after 3 seconds
        setTimeout(() => {
            if (document.querySelector('.scanner-text').textContent === 'Flashlight not available on this device') {
                document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
                document.querySelector('.scanner-text').style.color = '#fff';
            }
        }, 3000);
    }
}

// Camera flip functionality
async function flipCamera() {
    console.log('Flipping camera');
    
    try {
        // Toggle between front and back camera
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        // Update camera icon to show current mode
        const cameraBtn = document.querySelector('.nav-item span');
        if (cameraBtn && cameraBtn.textContent.trim() === 'Flip Camera') {
            const icon = cameraBtn.parentElement.querySelector('i');
            if (currentFacingMode === 'environment') {
                icon.classList.remove('fa-camera-retro');
                icon.classList.add('fa-camera');
            } else {
                icon.classList.remove('fa-camera');
                icon.classList.add('fa-camera-retro');
            }
        }
        
        // Restart camera with new facing mode
        await startCamera();
        
        // Update scanner text
        document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
        document.querySelector('.scanner-text').style.color = '#fff';
        
    } catch (error) {
        console.error('Camera flip failed:', error);
        
        // Show error message
        document.querySelector('.scanner-text').textContent = 'Camera flip failed. Please try again.';
        document.querySelector('.scanner-text').style.color = '#ff6b6b';
        
        // Revert to previous camera mode
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        // Try to restart with previous camera
        try {
            await startCamera();
            document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
            document.querySelector('.scanner-text').style.color = '#fff';
        } catch (restartError) {
            console.error('Failed to restart camera:', restartError);
            document.querySelector('.scanner-text').textContent = 'Camera access failed. Please refresh the page.';
            document.querySelector('.scanner-text').style.color = '#ff6b6b';
        }
        
        // Reset camera icon to previous state
        const cameraBtn = document.querySelector('.nav-item span');
        if (cameraBtn && cameraBtn.textContent.trim() === 'Flip Camera') {
            const icon = cameraBtn.parentElement.querySelector('i');
            if (currentFacingMode === 'environment') {
                icon.classList.remove('fa-camera-retro');
                icon.classList.add('fa-camera');
            } else {
                icon.classList.remove('fa-camera');
                icon.classList.add('fa-camera-retro');
            }
        }
    }
}

function startQRScanning() {
    if (scanning) return;
    scanning = true;
    
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    function scanFrame() {
        if (!scanning) return;
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data from canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple QR code detection (you can integrate with a QR library like jsQR)
        // For now, we'll just simulate detection
        detectQRCode(imageData);
        
        // Continue scanning
        requestAnimationFrame(scanFrame);
    }
    
    scanFrame();
}

function detectQRCode(imageData) {
    // This is a placeholder for actual QR code detection
    // In a real implementation, you would use a library like jsQR
    // For now, we'll just log that we're scanning
    console.log('Scanning for QR codes...');
    
    // Simulate QR code detection (remove this in real implementation)
    if (Math.random() < 0.001) { // Very low probability for demo
        handleQRCodeDetected("Demo QR Code: https://example.com");
    }
}

function handleQRCodeDetected(qrData) {
    console.log('QR Code detected:', qrData);
    scanning = false;
    
    // Update UI to show success
    document.querySelector('.scanner-text').textContent = 'QR Code detected!';
    document.querySelector('.scanner-text').style.color = '#4CAF50';
    
    // Stop camera
    stopCamera();
    
    // Process the QR code data
    processQRCode(qrData);
}

function processQRCode(qrData) {
    // Handle the QR code data
    console.log('Processing QR code:', qrData);
    
    // You can add your logic here to handle different types of QR codes
    // For example, redirect to a URL, show product info, etc.
    
    // Reset scanner after a delay
    setTimeout(() => {
        document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
        document.querySelector('.scanner-text').style.color = '#fff';
        startCamera();
    }, 2000);
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    scanning = false;
}

// Camera toggle functionality
function toggleCamera() {
    console.log('Camera toggled');
    
    if (scanning) {
        stopCamera();
        document.querySelector('.scanner-text').textContent = 'Camera stopped';
        document.querySelector('.scanner-text').style.color = '#ff6b6b';
    } else {
        startCamera();
        document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
        document.querySelector('.scanner-text').style.color = '#fff';
    }
    
    // Visual feedback
    const cameraBtn = document.querySelector('.nav-item span');
    if (cameraBtn && cameraBtn.textContent.trim() === 'Camera') {
        const icon = cameraBtn.parentElement.querySelector('i');
        if (icon.classList.contains('fa-camera')) {
            icon.classList.remove('fa-camera');
            icon.classList.add('fa-camera-retro');
        } else {
            icon.classList.remove('fa-camera-retro');
            icon.classList.add('fa-camera');
        }
    }
}

// Add loading overlay to DOM
function showLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = 9999;
        overlay.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;">
                <div class="spinner" style="border: 8px solid #f3f3f3; border-top: 8px solid #F26522; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite;"></div>
                <div style="color:#fff; margin-top:20px; font-size:1.5rem;">Photo saved!</div>
            </div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Photo taking functionality
function takePhoto() {
    if (!videoStream) {
        console.log('Camera not available');
        return;
    }
    
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64
    const imageBase64 = canvas.toDataURL('image/png');
    
    // Show loading overlay
    showLoadingOverlay();
    
    // Get username for file naming
    const username = localStorage.getItem('username');
    if (!username) {
        console.error('No username found');
        hideLoadingOverlay();
        return;
    }
    
    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${username}_scanned_${timestamp}.png`;
    
    // Save photo to backend (user's photos collection)
    fetch(`/api/user/${encodeURIComponent(username)}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            imageBase64,
            filename: filename,
            source: 'scanner'
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Photo saved to user collection:', data);
    })
    .catch(err => {
        console.error('Error saving photo to user collection:', err);
    });
    
    // Show loading for 3 seconds, then show success
    setTimeout(() => {
        hideLoadingOverlay();
        showPhotoFeedback();
    }, 3000);
}

function showPhotoFeedback() {
    const photoButton = document.getElementById('photo-button');
    const originalIcon = photoButton.querySelector('i');
    
    // Change icon to show success
    originalIcon.className = 'fa fa-check';
    photoButton.style.background = '#4CAF50';
    
    // Reset after 1 second
    setTimeout(() => {
        originalIcon.className = 'fa fa-camera';
        photoButton.style.background = '#F26522';
    }, 1000);
} 

// Photo gallery functionality
function openPhotoGallery() {
    console.log('Opening photo gallery');
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = false;
    fileInput.style.display = 'none';
    
    // Add event listener for file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // Show selected image info
            document.querySelector('.scanner-text').textContent = `Selected: ${file.name}`;
            document.querySelector('.scanner-text').style.color = '#4CAF50';
            
            // Process the selected image (you can add your image processing logic here)
            console.log('Selected image:', file.name, file.size, file.type);
            
            // Reset message after 3 seconds
            setTimeout(() => {
                if (document.querySelector('.scanner-text').textContent === `Selected: ${file.name}`) {
                    document.querySelector('.scanner-text').textContent = 'Position QR code within frame';
                    document.querySelector('.scanner-text').style.color = '#fff';
                }
            }, 3000);
        }
        
        // Clean up the file input
        document.body.removeChild(fileInput);
    });
    
    // Add file input to body and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();
}

// --- Custom Buttons Logic ---

// --- Feedback Message Area ---
function showFeedback(message, isError = true) {
    let feedback = document.getElementById('user-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'user-feedback';
        feedback.style.position = 'fixed';
        feedback.style.bottom = '110px';
        feedback.style.left = '50%';
        feedback.style.transform = 'translateX(-50%)';
        feedback.style.background = isError ? '#ffdddd' : '#ddffdd';
        feedback.style.color = isError ? '#b30000' : '#006600';
        feedback.style.padding = '8px 18px';
        feedback.style.borderRadius = '8px';
        feedback.style.fontSize = '0.98rem';
        feedback.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
        feedback.style.zIndex = 120;
        document.body.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = 'block';
    setTimeout(() => { feedback.style.display = 'none'; }, 2500);
}

// Upload from storage
const uploadButton = document.getElementById('upload-button');
if (uploadButton) {
    uploadButton.addEventListener('click', function() {
        let fileInput = document.getElementById('hidden-upload-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.id = 'hidden-upload-input';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        fileInput.value = '';
        fileInput.click();
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) {
                showFeedback('No file selected. Please choose an image.', true);
                return;
            }
            if (!file.type.startsWith('image/')) {
                showFeedback('Invalid file type. Please select an image.', true);
                return;
            }
            // TODO: handle the uploaded image file
            showFeedback('Image selected: ' + file.name, false);
        };
    });
}

// Manual code input
const manualCodeButton = document.getElementById('manual-code-button');
const manualCodeInputContainer = document.getElementById('manual-code-input-container');
const manualCodeInput = document.getElementById('manual-code-input');
const submitCodeBtn = document.getElementById('submit-code-btn');

if (manualCodeButton && manualCodeInputContainer) {
    manualCodeButton.addEventListener('click', function() {
        if (manualCodeInputContainer.style.display === 'none') {
            manualCodeInputContainer.style.display = 'flex';
            manualCodeInput.focus();
        } else {
            manualCodeInputContainer.style.display = 'none';
        }
    });
}

// Only allow numbers in the input
if (manualCodeInput) {
    manualCodeInput.addEventListener('input', function(e) {
        const oldValue = this.value;
        this.value = this.value.replace(/[^0-9]/g, '');
        if (oldValue !== this.value) {
            showFeedback('Only numbers are allowed in the code field.', true);
        }
    });
}

// Handle submit for manual code
if (submitCodeBtn && manualCodeInput) {
    submitCodeBtn.addEventListener('click', function() {
        const code = manualCodeInput.value.trim();
        if (code.length === 0) {
            showFeedback('Code cannot be empty. Please enter a number.', true);
            manualCodeInput.focus();
            return;
        }
        // TODO: handle the submitted code (e.g., processQRCode(code) or similar)
        showFeedback('Submitted code: ' + code, false);
        manualCodeInput.value = '';
        manualCodeInputContainer.style.display = 'none';
    });
}

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeScanner();
    
    // Add photo button functionality
    const photoButton = document.getElementById('photo-button');
    if (photoButton) {
        photoButton.addEventListener('click', takePhoto);
    }
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