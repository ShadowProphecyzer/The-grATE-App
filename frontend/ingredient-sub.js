document.getElementById('ingredient-sub-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('ingredient-sub-input').value.trim();
    const resultDiv = document.getElementById('ingredient-sub-result');
    if (!input) {
        resultDiv.textContent = 'Please enter an ingredient.';
        return;
    }
    resultDiv.textContent = 'Finding substitutes...';
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
                body: JSON.stringify({ tool: 'ingredient-sub', input, result })
            });
        }
    }, 1200);
}); 