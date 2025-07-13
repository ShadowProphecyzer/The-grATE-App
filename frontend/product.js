// Set greeting with username
window.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingDiv = document.getElementById('greeting');
        if (greetingDiv) {
            greetingDiv.innerHTML = '<i class="fa fa-lock" style="color:#F26522;"></i> <span>Hello</span> <span id="user-name">' + username + '</span>';
        }
    }
    
    // Load analysis results
    loadAnalysisResults();
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
            case 'Market':
                // Handle market navigation
                break;
            case 'Scan':
                window.location.href = 'scanner.html';
                break;
            case 'Help':
                // Handle help navigation
                break;
            case 'Logout':
                // Handle logout
                localStorage.removeItem('username');
                window.location.href = 'mainscreen.html';
                break;
        }
    });
});

// Load analysis results from backend
async function loadAnalysisResults() {
    const username = localStorage.getItem('username');
    if (!username) {
        showErrorState('User not authenticated');
        return;
    }

    try {
        // Show loading state
        showLoadingState();

        // Fetch latest analysis results
        const response = await fetch(`/api/user/${encodeURIComponent(username)}/latest-analysis`);
        
        if (!response.ok) {
            if (response.status === 404) {
                // No analysis found, show error state
                setTimeout(() => {
                    hideLoadingState();
                    showErrorState('No analysis results found. Please try scanning again.');
                }, 2000); // Show loading for at least 2 seconds
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }

        const data = await response.json();
        
        // Hide loading and show results
        setTimeout(() => {
            hideLoadingState();
            displayAnalysisResults(data.analysis);
        }, 2000); // Show loading for at least 2 seconds

    } catch (error) {
        console.error('Error loading analysis results:', error);
        hideLoadingState();
        showErrorState('Failed to load analysis results. Please try again.');
    }
}

// Display analysis results
function displayAnalysisResults(analysis) {
    const resultsDiv = document.getElementById('analysis-results');
    const errorDiv = document.getElementById('error-state');
    
    // Hide error state and show results
    errorDiv.style.display = 'none';
    resultsDiv.style.display = 'block';

    // Display original image
    const originalImage = document.getElementById('original-image');
    if (analysis.originalImage) {
        originalImage.src = analysis.originalImage;
        originalImage.style.display = 'block';
    } else {
        originalImage.style.display = 'none';
    }

    // Display OCR text
    const ocrText = document.getElementById('ocr-text');
    if (analysis.ocrText && analysis.ocrText.trim()) {
        ocrText.textContent = analysis.ocrText;
        document.getElementById('ocr-section').style.display = 'block';
    } else {
        document.getElementById('ocr-section').style.display = 'none';
    }

    // Display first AI analysis
    const firstAIText = document.getElementById('first-ai-text');
    if (analysis.firstAIAnalysis && analysis.firstAIAnalysis.trim()) {
        firstAIText.textContent = analysis.firstAIAnalysis;
        document.getElementById('first-ai-section').style.display = 'block';
    } else {
        document.getElementById('first-ai-section').style.display = 'none';
    }

    // Display second AI analysis
    const secondAIText = document.getElementById('second-ai-text');
    if (analysis.secondAIAnalysis && analysis.secondAIAnalysis.trim()) {
        secondAIText.textContent = analysis.secondAIAnalysis;
        document.getElementById('second-ai-section').style.display = 'block';
    } else {
        document.getElementById('second-ai-section').style.display = 'none';
    }

    // Add event listeners to action buttons
    setupActionButtons();
}

// Show loading state
function showLoadingState() {
    const loadingDiv = document.getElementById('loading-state');
    const resultsDiv = document.getElementById('analysis-results');
    const errorDiv = document.getElementById('error-state');
    
    loadingDiv.style.display = 'flex';
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    const loadingDiv = document.getElementById('loading-state');
    loadingDiv.style.display = 'none';
}

// Show error state
function showErrorState(message) {
    const errorDiv = document.getElementById('error-state');
    const resultsDiv = document.getElementById('analysis-results');
    const loadingDiv = document.getElementById('loading-state');
    
    loadingDiv.style.display = 'none';
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'flex';
    
    // Update error message if provided
    if (message) {
        const errorText = errorDiv.querySelector('.error-text');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

// Setup action button event listeners
function setupActionButtons() {
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveResults();
        });
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareResults();
        });
    }

    // New scan button
    const newScanBtn = document.getElementById('new-scan-btn');
    if (newScanBtn) {
        newScanBtn.addEventListener('click', function() {
            window.location.href = 'scanner.html';
        });
    }

    // Retry button (in error state)
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            loadAnalysisResults();
        });
    }
}

// Save results functionality
function saveResults() {
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.innerHTML;
    
    // Show saving state
    saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>Saving...</span>';
    saveBtn.disabled = true;
    
    // Simulate save operation
    setTimeout(() => {
        // Show success state
        saveBtn.innerHTML = '<i class="fa fa-check"></i><span>Saved!</span>';
        saveBtn.style.background = '#4CAF50';
        saveBtn.style.borderColor = '#4CAF50';
        
        // Reset after 2 seconds
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
            saveBtn.style.borderColor = '';
            saveBtn.disabled = false;
        }, 2000);
    }, 1500);
}

// Share results functionality
function shareResults() {
    const shareBtn = document.getElementById('share-btn');
    const originalText = shareBtn.innerHTML;
    
    // Show sharing state
    shareBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>Sharing...</span>';
    shareBtn.disabled = true;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Food Analysis Results',
            text: 'Check out my food analysis results from the Food Finder app!',
            url: window.location.href
        }).then(() => {
            // Show success state
            shareBtn.innerHTML = '<i class="fa fa-check"></i><span>Shared!</span>';
            shareBtn.style.background = '#4CAF50';
            shareBtn.style.borderColor = '#4CAF50';
        }).catch((error) => {
            console.log('Error sharing:', error);
            // Show error state
            shareBtn.innerHTML = '<i class="fa fa-times"></i><span>Failed</span>';
            shareBtn.style.background = '#f44336';
            shareBtn.style.borderColor = '#f44336';
        }).finally(() => {
            // Reset after 2 seconds
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                shareBtn.style.background = '';
                shareBtn.style.borderColor = '';
                shareBtn.disabled = false;
            }, 2000);
        });
    } else {
        // Fallback: copy to clipboard
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            // Show success state
            shareBtn.innerHTML = '<i class="fa fa-check"></i><span>Copied!</span>';
            shareBtn.style.background = '#4CAF50';
            shareBtn.style.borderColor = '#4CAF50';
        }).catch(() => {
            // Show error state
            shareBtn.innerHTML = '<i class="fa fa-times"></i><span>Failed</span>';
            shareBtn.style.background = '#f44336';
            shareBtn.style.borderColor = '#f44336';
        }).finally(() => {
            // Reset after 2 seconds
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                shareBtn.style.background = '';
                shareBtn.style.borderColor = '';
                shareBtn.disabled = false;
            }, 2000);
        });
    }
}

// Auto-refresh functionality to check for new results
let refreshInterval;

function startAutoRefresh() {
    // Check for new results every 10 seconds
    refreshInterval = setInterval(() => {
        const username = localStorage.getItem('username');
        if (username) {
            fetch(`/api/user/${encodeURIComponent(username)}/latest-analysis`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    return null;
                })
                .then(data => {
                    if (data && data.analysis) {
                        // Check if this is a newer analysis
                        const currentAnalysis = document.getElementById('first-ai-text').textContent;
                        if (data.analysis.firstAIAnalysis !== currentAnalysis) {
                            // New analysis available, reload
                            loadAnalysisResults();
                        }
                    }
                })
                .catch(error => {
                    console.log('Auto-refresh check failed:', error);
                });
        }
    }, 10000); // 10 seconds
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Start auto-refresh when page loads
document.addEventListener('DOMContentLoaded', function() {
    startAutoRefresh();
});

// Stop auto-refresh when page unloads
window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
}); 