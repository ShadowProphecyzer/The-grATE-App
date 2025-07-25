document.getElementById('health-eval-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('health-eval-input').value.trim();
    const resultDiv = document.getElementById('health-eval-result');
    if (!input) {
        resultDiv.textContent = 'Please enter a product or ingredients.';
        return;
    }
    resultDiv.textContent = 'Evaluating...';
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
                body: JSON.stringify({ tool: 'health-eval', input, result })
            });
        }
    }, 1200);
}); 