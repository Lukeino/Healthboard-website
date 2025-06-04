const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth');

// GET - Ottieni tutti gli esami
router.get('/', auth, (req, res) => {
  const { patient_id, status } = req.query;
  
  let query = 'SELECT * FROM examinations';
  let params = [];
  
  if (patient_id) {
    query += ' WHERE patient_id = ?';
    params.push(patient_id);
  }
  
  if (status) {
    if (params.length > 0) {
      query += ' AND';
    } else {
      query += ' WHERE';
    }
    
    if (status === 'pending') {
      query += ' (risultato IS NULL OR risultato = "")';
    } else if (status === 'completed') {
      query += ' (risultato IS NOT NULL AND risultato != "")';
    }
  }
  
  query += ' ORDER BY data_esame DESC';
  
  db.all(query, params, (err, examinations) => {
    if (err) {
      console.error('Errore nel recupero esami:', err);
      return res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
    
    res.json({
      success: true,
      data: examinations
    });
  });
});

// GET - Ottieni esami pendenti (per dashboard)
router.get('/pending', auth, (req, res) => {
  const query = `
    SELECT COUNT(*) as count 
    FROM examinations 
    WHERE risultato IS NULL OR risultato = ""
  `;
  
  db.get(query, [], (err, result) => {
    if (err) {
      console.error('Errore nel conteggio esami pendenti:', err);
      return res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
    
    res.json({
      success: true,
      count: result.count
    });
  });
});

// POST - Crea nuovo esame
router.post('/', auth, (req, res) => {
  const {
    visit_id,
    patient_id,
    tipo_esame,
    descrizione,
    risultato,
    valori_normali,
    data_esame,
    note
  } = req.body;

  // Validazione campi obbligatori
  if (!visit_id || !patient_id || !tipo_esame || !data_esame) {
    return res.status(400).json({
      success: false,
      message: 'Campi obbligatori mancanti'
    });
  }

  const query = `
    INSERT INTO examinations (
      visit_id, patient_id, tipo_esame, descrizione, 
      risultato, valori_normali, data_esame, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    visit_id, patient_id, tipo_esame, descrizione,
    risultato, valori_normali, data_esame, note
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Errore nella creazione esame:', err);
      return res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Esame creato con successo',
      id: this.lastID
    });
  });
});

// PUT - Aggiorna esame (principalmente per aggiungere risultati)
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { risultato, note } = req.body;

  const query = `
    UPDATE examinations 
    SET risultato = ?, note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [risultato, note, id], function(err) {
    if (err) {
      console.error('Errore nell\'aggiornamento esame:', err);
      return res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Esame non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Esame aggiornato con successo'
    });
  });
});

module.exports = router;
