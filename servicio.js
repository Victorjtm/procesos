const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database'); // Asegúrate de que esto esté configurado correctamente
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const secretKey = 'secret123'; // Cambia esto a una clave secreta segura en producción

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Definir rutas
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/verificar-usuario/:username', (req, res) => {
  const username = req.params.username;

  db.get('SELECT username, email FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).send("Error al verificar el usuario.");
    } else if (row) {
      res.json({ exists: true, email: row.email });  // Incluye el email en la respuesta
    } else {
      res.json({ exists: false });
    }
  });
});


app.post('/registro', async (req, res) => { 
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const hashedPassword = await bcrypt.hash(password, 10);

  const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
  stmt.run(username, email, hashedPassword, (err) => {
    if (err) {
      res.status(500).send("Error al guardar el usuario.");
    } else {
      res.redirect('/registro?success=true');
    }
  });
  stmt.finalize();
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (err) {
      res.status(500).send("Error al buscar el usuario.");
    } else if (row && await bcrypt.compare(password, row.password)) {
      const token = jwt.sign({ username: row.username }, secretKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/');
    } else {
      res.status(401).send("Credenciales inválidas.");
    }
  });
});



const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).send('No autorizado');
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).send('No autorizado');
  }
};

app.post('/eliminar-usuario/:username', authenticate, (req, res) => {
  const username = req.params.username;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).send('Error al verificar el usuario.');
    }
    if (row) {
      if (req.user.username === username) {
        return res.status(403).send('No se puede eliminar el usuario que está logueado.');
      }
      db.run('DELETE FROM users WHERE username = ?', [username], (err) => {
        if (err) {
          return res.status(500).send('Error al eliminar el usuario.');
        }
        res.send('Usuario eliminado con éxito.');
      });
    } else {
      res.status(404).send('Usuario no encontrado.');
    }
  });
});


app.get('/check-auth', authenticate, (req, res) => {
  res.json({ username: req.user.username });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


