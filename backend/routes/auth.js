const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Registrazione nuovo utente
router.post('/register', async (req, res) => {
  const { username, email, password, nome, cognome, ruolo = 'medico' } = req.body;

  try {
    // Controlla se l'utente esiste già
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Errore del server' });
      }

      if (user) {
        return res.status(400).json({ message: 'Utente già esistente' });
      }

      // Hash della password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserisci nuovo utente
      db.run(
        'INSERT INTO users (username, email, password, nome, cognome, ruolo) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, nome, cognome, ruolo],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Errore durante la registrazione' });
          }

          res.status(201).json({ 
            message: 'Utente registrato con successo',
            userId: this.lastID
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Errore del server' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Credenziali non valide' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          nome: user.nome,
          cognome: user.cognome,
          ruolo: user.ruolo
        },
        process.env.JWT_SECRET || 'healthboard_secret_key',
        { expiresIn: '24h' }
      );

      res.json({ 
        token,
        user: {
          id: user.id,
          username: user.username,
          nome: user.nome,
          cognome: user.cognome,
          ruolo: user.ruolo
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Errore del server' });
    }
  });
});

// Verifica token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true,
    user: req.user
  });
});

module.exports = router;
