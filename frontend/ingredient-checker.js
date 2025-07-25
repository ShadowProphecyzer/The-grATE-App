document.getElementById('ingredient-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('ingredient-input').value.trim();
    const resultDiv = document.getElementById('ingredient-result');
    if (!input) {
        resultDiv.textContent = 'Please enter some ingredients.';
        return;
    }
    // Collect selected options
    const optionEls = document.querySelectorAll('#ingredient-options input[type="checkbox"]');
    const options = [];
    optionEls.forEach(cb => { if (cb.checked) options.push(cb.parentElement.textContent.trim()); });
    if (options.length === 0) {
        resultDiv.textContent = 'Please select at least one dietary option to check.';
        return;
    }
    resultDiv.textContent = 'Checking ingredients...';
    try {
        const response = await fetch('/api/ingredient-checker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: input, options })
        });
        const data = await response.json();
        if (data.result) {
            resultDiv.innerHTML = '<b>Result:</b><br>' + data.result.replace(/\n/g, '<br>');
            // Store tool usage in backend
            const username = localStorage.getItem('username');
            if (username) {
                await fetch(`/api/user/${encodeURIComponent(username)}/tool-history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ tool: 'ingredient-checker', input, result: data.result })
                });
            }
        } else {
            resultDiv.textContent = data.error || 'No result from server.';
        }
    } catch (err) {
        resultDiv.textContent = 'Error checking ingredients.';
    }
}); 