document.getElementById('reviews-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('reviews-input').value.trim();
    const resultDiv = document.getElementById('reviews-result');
    if (!input) {
        resultDiv.textContent = 'Please enter your review or report.';
        return;
    }
    resultDiv.textContent = 'Submitting...';
    setTimeout(async () => {
        const result = '(OpenAI API response will appear here)';
        resultDiv.innerHTML = '<b>Result:</b> ' + result;
        // Store tool usage in backend
        const username = localStorage.getItem('username');
        if (username) {
            await fetch(`/api/user/${encodeURIComponent(username)}/tool-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ tool: 'reviews', input, result })
            });
        }
    }, 1200);
}); 