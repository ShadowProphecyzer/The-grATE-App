document.getElementById('symptom-logger-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('symptom-logger-input').value.trim();
    const resultDiv = document.getElementById('symptom-logger-result');
    if (!input) {
        resultDiv.textContent = 'Please describe your symptoms and foods eaten.';
        return;
    }
    resultDiv.textContent = 'Logging...';
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
                body: JSON.stringify({ tool: 'symptom-logger', input, result })
            });
        }
    }, 1200);
}); 