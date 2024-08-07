// checkLongeado.js

// Función para comprobar si el usuario está autenticado
async function checkAuthentication() {
    try {
        const response = await fetch('/check-auth');
        const userInfo = document.getElementById('user-info');
        const logoutButton = document.getElementById('logout');

        if (response.status === 200) {
            const user = await response.json();
            userInfo.innerText = `Usuario conectado: ${user.username}`;
            logoutButton.style.display = 'inline-block';
        } else {
            userInfo.innerText = 'Ningún usuario conectado';
            logoutButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        document.getElementById('user-info').innerText = 'Ningún usuario conectado';
        document.getElementById('logout').style.display = 'none';
    }
}

// Función para manejar el logout
async function handleLogout() {
    try {   
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        if (response.ok) {
            document.getElementById('user-info').innerText = 'Ningún usuario conectado';
            document.getElementById('logout').style.display = 'none';
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Asignar el manejador de eventos al botón de logout
document.getElementById('logout').addEventListener('click', handleLogout);

// Llamar a la función al cargar la página
window.onload = checkAuthentication;



