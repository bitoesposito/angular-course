const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Database simulato (in produzione usare un vero database)
const users = [];

// Middleware per validazione
const validateAuth = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username deve essere di almeno 3 caratteri')
    .trim()
    .escape(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password deve essere di almeno 8 caratteri')
];

// Middleware per verificare token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token di accesso richiesto' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/register - Registrazione nuovo utente
router.post('/register', validateAuth, async (req, res) => {
  try {
    // Verifica errori di validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dati non validi',
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Verifica se l'utente esiste già
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username già in uso' });
    }

    // Hash della password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crea nuovo utente
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    // Genera JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utente registrato con successo',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});

// POST /api/auth/login - Login utente
router.post('/login', validateAuth, async (req, res) => {
  try {
    // Verifica errori di validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dati non validi',
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Trova l'utente
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Verifica password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Genera JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login effettuato con successo',
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// GET /api/auth/me - Ottieni dati utente corrente
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utente non trovato' });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt
    }
  });
});

module.exports = router;
