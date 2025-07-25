document.getElementById('diet-recommend-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('diet-recommend-input').value.trim();
    const resultDiv = document.getElementById('diet-recommend-result');
    if (!input) {
        resultDiv.textContent = 'Please enter your dietary preferences or goals.';
        return;
    }
    resultDiv.textContent = 'Getting recommendations...';
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
                body: JSON.stringify({ tool: 'diet-recommend', input, result })
            });
        }
    }, 1200);
}); 