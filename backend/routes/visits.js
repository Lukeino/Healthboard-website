const express = require('express');
const db = require('../database/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Applica middleware di autenticazione
router.use(authMiddleware);

// GET - Ottieni tutte le visite (con filtri opzionali)
router.get('/', (req, res) => {
  const { patient_id, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT v.*, p.nome as patient_nome, p.cognome as patient_cognome,
           u.nome as medico_nome, u.cognome as medico_cognome
    FROM visits v
    JOIN patients p ON v.patient_id = p.id
    JOIN users u ON v.user_id = u.id
  `;
  
  const params = [];

  if (patient_id) {
    query += ' WHERE v.patient_id = ?';
    params.push(patient_id);
  }

  query += ' ORDER BY v.data_visita DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, visits) => {
    if (err) {
      return res.status(500).json({ message: 'Errore nel recupero visite' });
    }
    res.json(visits);
  });
});

// GET - Ottieni visita per ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT v.*, p.nome as patient_nome, p.cognome as patient_cognome,
           u.nome as medico_nome, u.cognome as medico_cognome
    FROM visits v
    JOIN patients p ON v.patient_id = p.id
    JOIN users u ON v.user_id = u.id
    WHERE v.id = ?
  `;

  db.get(query, [id], (err, visit) => {
    if (err) {
      return res.status(500).json({ message: 'Errore nel recupero visita' });
    }
    
    if (!visit) {
      return res.status(404).json({ message: 'Visita non trovata' });
    }

    // Recupera anche parametri vitali ed esami
    const vitalSignsQuery = 'SELECT * FROM vital_signs WHERE visit_id = ?';
    const examinationsQuery = 'SELECT * FROM examinations WHERE visit_id = ?';

    db.all(vitalSignsQuery, [id], (err, vitalSigns) => {
      if (err) {
        return res.status(500).json({ message: 'Errore nel recupero parametri vitali' });
      }

      db.all(examinationsQuery, [id], (err, examinations) => {
        if (err) {
          return res.status(500).json({ message: 'Errore nel recupero esami' });
        }

        res.json({
          ...visit,
          vital_signs: vitalSigns,
          examinations: examinations
        });
      });
    });
  });
});

// POST - Crea nuova visita
router.post('/', (req, res) => {
  const {
    patient_id,
    data_visita,
    tipo_visita,
    motivo,
    anamnesi,
    esame_obiettivo,
    diagnosi,
    terapia,
    note,
    vital_signs,
    examinations
  } = req.body;

  const user_id = req.user.id;

  // Validazione campi obbligatori
  if (!patient_id || !data_visita || !tipo_visita) {
    return res.status(400).json({ message: 'Campi obbligatori mancanti' });
  }

  // Verifica che il paziente esista
  db.get('SELECT id FROM patients WHERE id = ?', [patient_id], (err, patient) => {
    if (err) {
      return res.status(500).json({ message: 'Errore del server' });
    }

    if (!patient) {
      return res.status(404).json({ message: 'Paziente non trovato' });
    }

    // Inserisci nuova visita
    db.run(
      `INSERT INTO visits (
        patient_id, user_id, data_visita, tipo_visita, motivo,
        anamnesi, esame_obiettivo, diagnosi, terapia, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id, user_id, data_visita, tipo_visita, motivo,
        anamnesi, esame_obiettivo, diagnosi, terapia, note
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Errore durante la creazione della visita' });
        }

        const visitId = this.lastID;

        // Inserisci parametri vitali se forniti
        if (vital_signs && Object.keys(vital_signs).length > 0) {
          const {
            pressione_sistolica, pressione_diastolica, frequenza_cardiaca,
            temperatura, peso, altezza, saturazione_ossigeno, glicemia, note: vs_note
          } = vital_signs;

          db.run(
            `INSERT INTO vital_signs (
              visit_id, patient_id, pressione_sistolica, pressione_diastolica,
              frequenza_cardiaca, temperatura, peso, altezza, saturazione_ossigeno,
              glicemia, note
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              visitId, patient_id, pressione_sistolica, pressione_diastolica,
              frequenza_cardiaca, temperatura, peso, altezza, saturazione_ossigeno,
              glicemia, vs_note
            ]
          );
        }

        // Inserisci esami se forniti
        if (examinations && Array.isArray(examinations)) {
          examinations.forEach(exam => {
            const { tipo_esame, descrizione, risultato, valori_normali, data_esame, note: exam_note } = exam;
            
            db.run(
              `INSERT INTO examinations (
                visit_id, patient_id, tipo_esame, descrizione, risultato,
                valori_normali, data_esame, note
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [visitId, patient_id, tipo_esame, descrizione, risultato, valori_normali, data_esame, exam_note]
            );
          });
        }

        res.status(201).json({
          message: 'Visita creata con successo',
          visitId: visitId
        });
      }
    );
  });
});

// PUT - Aggiorna visita
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    data_visita,
    tipo_visita,
    motivo,
    anamnesi,
    esame_obiettivo,
    diagnosi,
    terapia,
    note
  } = req.body;

  db.run(
    `UPDATE visits SET 
      data_visita = ?, tipo_visita = ?, motivo = ?, anamnesi = ?,
      esame_obiettivo = ?, diagnosi = ?, terapia = ?, note = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [data_visita, tipo_visita, motivo, anamnesi, esame_obiettivo, diagnosi, terapia, note, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Errore durante l\'aggiornamento' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Visita non trovata' });
      }

      res.json({ message: 'Visita aggiornata con successo' });
    }
  );
});

// DELETE - Elimina visita
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM visits WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Errore durante l\'eliminazione' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Visita non trovata' });
    }

    res.json({ message: 'Visita eliminata con successo' });
  });
});

module.exports = router;
