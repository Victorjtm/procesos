const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el formulario de login
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Ruta para manejar el envío del formulario de login
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
  stmt.run(username, password, (err) => {
    if (err) {
      res.status(500).send("Error al guardar el usuario.");
    } else {
      res.send("Usuario guardado exitosamente.");
    }
  });
  stmt.finalize();
});

// Ruta para el formulario de registro
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});

// Ruta para manejar el envío del formulario de registro
app.post('/register', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
  stmt.run(username, email, password, (err) => {
    if (err) {
      res.status(500).send("Error al registrar el usuario.");
    } else {
      res.send("Usuario registrado exitosamente.");
    }
  });
  stmt.finalize();
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

