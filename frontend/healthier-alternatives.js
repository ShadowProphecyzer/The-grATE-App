document.getElementById('alternatives-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('alternatives-input').value.trim();
    const resultDiv = document.getElementById('alternatives-result');
    if (!input) {
        resultDiv.textContent = 'Please enter a product or food name.';
        return;
    }
    resultDiv.textContent = 'Finding alternatives...';
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
                body: JSON.stringify({ tool: 'healthier-alternatives', input, result })
            });
        }
    }, 1200);
}); 