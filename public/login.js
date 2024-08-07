document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, false);
            if (data.success) {
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } else {
            showMessage(data.message, true);
        }
    } catch (error) {
        showMessage('Error en el servidor', true);
    }
});

function showMessage(message, isError) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.className = 'message ' + (isError ? 'error' : 'success');
    messageBox.style.display = 'block';
}