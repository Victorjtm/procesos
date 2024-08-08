// Función principal para validar el formulario
function validarFormulario() {
  debugger;
  // Obtener valores de los campos
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  console.log('Datos en valida formulario:', { username, email, password, confirmPassword });

  // Variables para control de errores
  let usernameValido = false;
  let emailValido = false;
  let passwordValido = false;
  let confirmPasswordValido = false;

  // Validación de nombre de usuario
  if (username.length > 3 && username.length < 20) {
    usernameValido = true;
    document.getElementById("usernameError").style.display = "none";
  } else {
    document.getElementById("usernameError").textContent = "El nombre de usuario debe tener entre 4 y 19 caracteres.";
    document.getElementById("usernameError").style.display = "block";
  }

  // Validación de email usando expresión regular
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email)) {
    emailValido = true;
    document.getElementById("emailError").style.display = "none";
  } else {
    document.getElementById("emailError").textContent = "Ingrese un email válido.";
    document.getElementById("emailError").style.display = "block";
  }

  // Validación de longitud de password
  if (password.length > 8 && password.length < 16) {
    passwordValido = true;
    document.getElementById("passwordError").style.display = "none";
  } else {
    document.getElementById("passwordError").textContent = "La contraseña debe tener entre 9 y 15 caracteres.";
    document.getElementById("passwordError").style.display = "block";
  }

  // Validación de coincidencia de password y confirmPassword
  if (password === confirmPassword) {
    confirmPasswordValido = true;
    document.getElementById("confirmPasswordError").style.display = "none";
  } else {
    document.getElementById("confirmPasswordError").textContent = "Las contraseñas no coinciden.";
    document.getElementById("confirmPasswordError").style.display = "block";
  }

  // Verificar si todos los campos son válidos
  return usernameValido && emailValido && passwordValido && confirmPasswordValido;
}

// Función para verificar si el usuario existe
function verificarUsuario() {
  const username = document.getElementById("username").value.trim();
  if (username) {
    fetch(`/verificar-usuario/${username}`)
      .then(response => response.json())
      .then(data => {
        if (data.exists) {
          // Si el usuario existe, rellenar los otros campos
          document.getElementById('email').value = data.email;
          document.getElementById('mensaje').textContent = 'Usuario encontrado. Se han rellenado los campos disponibles.';
          document.getElementById('mensaje').style.color = 'blue';
        } else {
          document.getElementById('mensaje').textContent = 'Usuario no encontrado.';
          document.getElementById('mensaje').style.color = 'orange';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('mensaje').textContent = 'Error al verificar el usuario.';
        document.getElementById('mensaje').style.color = 'red';
      });
  }
}

// Función para mostrar mensaje de éxito o error después del registro
function mostrarMensajeRegistro() {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const mensaje = document.getElementById('mensaje');

  if (success === 'true') {
    mensaje.textContent = 'Guardado con Éxito';
    mensaje.style.color = 'green';
  } else if (success === 'false') {
    mensaje.textContent = 'Error al guardar el usuario';
    mensaje.style.color = 'red';
  }
}

// Función para eliminar el usuario
function eliminarUsuario() {
  const username = document.getElementById('username').value.trim();
  if (username) {
    fetch(`/eliminar-usuario/${username}`, {
      method: 'POST',
      credentials: 'include' // Asegúrate de que las cookies se envíen
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text); });
      }
      return response.text();
    })
    .then(message => {
      document.getElementById('mensaje').textContent = message;
      document.getElementById('mensaje').style.color = 'green';
    })
    .catch(error => {
      document.getElementById('mensaje').textContent = error.message;
      document.getElementById('mensaje').style.color = 'red';
    });
  }
}

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Añadir event listener para verificar usuario cuando se pierde el foco en el campo username
  document.getElementById('username').addEventListener('blur', verificarUsuario);

  // Añadir event listener para validar el formulario antes de enviarlo
  document.getElementById('registroForm').addEventListener('submit', function(event) {
    if (!validarFormulario()) {
      event.preventDefault(); // Prevenir el envío del formulario si no es válido
    }
  });

  // Mostrar mensaje de registro si existe
  mostrarMensajeRegistro();

  // Añadir event listener para eliminar usuario
  document.getElementById('eliminar').addEventListener('click', eliminarUsuario);
});

function obtenerUsuarioLogueado() {
  return fetch('/check-auth')
    .then(response => response.json())
    .then(data => data.username)
    .catch(error => {
      console.error('Ningún usuario conectado:', error);
      return null;
    });
}

function modificarUsuario() {
  if (validarFormulario()) {
    obtenerUsuarioLogueado().then(usuarioLogueado => {
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      console.log('Datos a enviar:', { username, email, password });

      if (usuarioLogueado === username) {
        fetch('/modificar-usuario', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(message => {
          document.getElementById('mensaje').textContent = message;
          document.getElementById('mensaje').style.color = 'green';
        })
        .catch(error => {
          console.error('Error:', error);
          document.getElementById('mensaje').textContent = 'Error al modificar el usuario: ' + error.message;
          document.getElementById('mensaje').style.color = 'red';
        });
      } else {
        document.getElementById('mensaje').textContent = 'No puedes modificar un usuario diferente al que está logueado.';
        document.getElementById('mensaje').style.color = 'red';
      }
    });
  }
}

document.getElementById('modificar').addEventListener('click', modificarUsuario);

function enviarFormulario(event) {
  event.preventDefault();
  if (validarFormulario()) {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch('/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password })
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.text();
    })
    .then(message => {
      document.getElementById('mensaje').textContent = message;
      document.getElementById('mensaje').style.color = 'green';
    })
    .catch(error => {
      document.getElementById('mensaje').textContent = error.message;
      document.getElementById('mensaje').style.color = 'red';
    });
  }
}

document.getElementById('registroForm').addEventListener('submit', enviarFormulario);