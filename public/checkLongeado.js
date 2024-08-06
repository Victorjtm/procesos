// Función para comprobar si el usuario está autenticado
async function checkAuthentication() {
    try {
        const response = await fetch('/check-auth');
        if (response.status === 200) {
            const user = await response.json();
            console.log(user);
            document.getElementById('user-info').innerText = `Usuario conectado: ${user.username}`;
            document.getElementById('logout').style.display = 'block';
        } else {
            document.getElementById('user-info').innerHTML = '<a href="/login">Login</a>';
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        document.getElementById('user-info').innerHTML = '<a href="/login">Login</a>';
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
            document.getElementById('user-info').innerHTML = '<a href="/login">Login</a>';
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



