const express = require('express');
const bodyParser = require('body-parser'); // Si estás usando body-parser, asegúrate de que esté configurado correctamente
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
app.use(bodyParser.json()); // Asegúrate de que esto esté presente para parsear JSON
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

  if (!username || !password || !email) {
    return res.status(400).send("Faltan datos en la solicitud.");
  }

  try {
    // Verificar si el email ya existe
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).send("Error al verificar el email.");
      }
      if (row) {
        return res.status(400).send("El email ya está registrado.");
      }

      // Si el email no existe, proceder a verificar el usuario
      db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
          return res.status(500).send("Error al verificar el usuario.");
        }
        if (row) {
          return res.status(400).send("El nombre de usuario ya existe.");
        }

        // Si ni el email ni el usuario existen, proceder a registrar
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
          stmt.run(username, email, hashedPassword, (err) => {
            if (err) {
              return res.status(500).send("Error al guardar el usuario.");
            }
            res.status(200).send("Usuario registrado con éxito.");
          });
          stmt.finalize();
        } catch (error) {
          res.status(500).send("Error al cifrar la contraseña.");
        }
      });
    });
  } catch (error) {
    res.status(500).send("Error inesperado.");
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Faltan datos en la solicitud.");
  }

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

app.post('/modificar-usuario', authenticate, async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Datos recibidos en el servidor:', { username, email, password });

  if (!username || !email || !password) {
    return res.status(400).send("Faltan datos en la solicitud.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (req.user.username === username) {
      db.run('UPDATE users SET email = ?, password = ? WHERE username = ?', [email, hashedPassword, username], (err) => {
        if (err) {
          console.error('Error al modificar usuario:', err);
          res.status(500).send('Error al modificar el usuario.');
        } else {
          console.log('Usuario modificado con éxito');
          res.send('Usuario modificado con éxito.');
        }
      });
    } else {
      console.log('Intento de modificación no autorizado');
      res.status(403).send('No tienes permisos para modificar este usuario.');
    }
  } catch (error) {
    console.error('Error al cifrar la contraseña:', error);
    res.status(500).send('Error al cifrar la contraseña.');
  }
});

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

