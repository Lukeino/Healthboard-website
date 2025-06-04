const express = require('express');
const db = require('../database/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Applica middleware di autenticazione a tutte le routes
router.use(authMiddleware);

// GET - Ottieni tutti i pazienti
router.get('/', (req, res) => {
  const { search, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM patients';
  const params = [];

  if (search) {
    query += ' WHERE nome LIKE ? OR cognome LIKE ? OR codice_fiscale LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY cognome, nome LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, patients) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Errore nel recupero pazienti' 
      });
    }
    res.json({
      success: true,
      data: patients
    });
  });
});

// GET - Ottieni paziente per ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM patients WHERE id = ?', [id], (err, patient) => {
    if (err) {
      return res.status(500).json({ message: 'Errore nel recupero paziente' });
    }
    
    if (!patient) {
      return res.status(404).json({ message: 'Paziente non trovato' });
    }

    res.json(patient);
  });
});

// POST - Crea nuovo paziente
router.post('/', (req, res) => {
  const {
    codice_fiscale,
    nome,
    cognome,
    data_nascita,
    sesso,
    telefono,
    email,
    indirizzo,
    citta,
    cap,
    provincia,
    medico_curante,
    note_generali
  } = req.body;

  // Validazione campi obbligatori
  if (!codice_fiscale || !nome || !cognome || !data_nascita || !sesso) {
    return res.status(400).json({ message: 'Campi obbligatori mancanti' });
  }

  // Controlla se il codice fiscale esiste già
  db.get('SELECT id FROM patients WHERE codice_fiscale = ?', [codice_fiscale], (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Errore del server' });
    }

    if (existing) {
      return res.status(400).json({ message: 'Codice fiscale già esistente' });
    }

    // Inserisci nuovo paziente
    db.run(
      `INSERT INTO patients (
        codice_fiscale, nome, cognome, data_nascita, sesso,
        telefono, email, indirizzo, citta, cap, provincia,
        medico_curante, note_generali
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codice_fiscale, nome, cognome, data_nascita, sesso,
        telefono, email, indirizzo, citta, cap, provincia,
        medico_curante, note_generali
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Errore durante la creazione del paziente' });
        }        res.status(201).json({
          success: true,
          message: 'Paziente creato con successo',
          patientId: this.lastID
        });
      }
    );
  });
});

// PUT - Aggiorna paziente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    codice_fiscale,
    nome,
    cognome,
    data_nascita,
    sesso,
    telefono,
    email,
    indirizzo,
    citta,
    cap,
    provincia,
    medico_curante,
    note_generali
  } = req.body;

  db.run(
    `UPDATE patients SET 
      codice_fiscale = ?, nome = ?, cognome = ?, data_nascita = ?, sesso = ?,
      telefono = ?, email = ?, indirizzo = ?, citta = ?, cap = ?, provincia = ?,
      medico_curante = ?, note_generali = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      codice_fiscale, nome, cognome, data_nascita, sesso,
      telefono, email, indirizzo, citta, cap, provincia,
      medico_curante, note_generali, id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Errore durante l\'aggiornamento' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Paziente non trovato' });
      }

      res.json({ message: 'Paziente aggiornato con successo' });
    }
  );
});

// DELETE - Elimina paziente
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM patients WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Errore durante l\'eliminazione' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Paziente non trovato' });
    }

    res.json({ message: 'Paziente eliminato con successo' });
  });
});

module.exports = router;
