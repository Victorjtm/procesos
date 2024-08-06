// Importamos los módulos.
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const usuariosRoutes = require('./routers/routerUsuario');
const usuariosTablas = require('./routers/tablaUsuario')



// Configuramos express
const app = express();
const port = 3000;

// Configurar el middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/usuarios', usuariosRoutes);
app.use('/tablas', usuariosTablas);

// Ruta GET para servir el formulario de registro
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

// Ruta GET para servir el formulario de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/verificar-usuario/:username', (req, res) => {
  const username = req.params.username;
  
  // Consulta para buscar el usuario en la base de datos
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      res.status(500).json({ error: "Error al buscar el usuario" });
    } else if (row) {
      // Si el usuario existe, devuelve sus datos
      res.json({
        exists: true,
        email: row.email,
        // Añade aquí otros campos que quieras devolver
      });
    } else {
      // Si el usuario no existe
      res.json({ exists: false });
    }
  });
});

// Ruta POST para manejar el registro del usuario
app.post('/registro', (req, res) => { 
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
  
    // Preparar la consulta de inserción
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    
    // Ejecutar la consulta
    stmt.run(username, email, password, (err) => {
      if (err) {
        // Si hay un error, enviar una respuesta de error
        res.status(500).send("Error al guardar el usuario.");
      } else {
        // Si se guarda con éxito, redirigir al formulario de registro con un parámetro
        res.redirect('/registro?success=true');
      }
    });
    
    stmt.finalize();
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
