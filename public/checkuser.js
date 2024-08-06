document.addEventListener('DOMContentLoaded', function() {
    // Obtener y mostrar la información del usuario logueado
    fetch('/check-auth')
      .then(response => response.json())
      .then(data => {
        const userInfo = document.getElementById('user-info');
        if (data.username) {
          userInfo.textContent = `Usuario logueado: ${data.username}`;
        } else {
          userInfo.textContent = 'No estás logueado';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('user-info').textContent = 'Error al obtener la información del usuario.';
      });
  });
  