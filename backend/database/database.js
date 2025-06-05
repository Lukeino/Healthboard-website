const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea o connette al database SQLite
const dbPath = path.join(__dirname, 'healthboard.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Errore connessione database:', err.message);
  } else {
    console.log('✅ Connesso al database SQLite Healthboard');
  }
});

// Inizializza le tabelle
db.serialize(() => {
  // Tabella utenti (medici/operatori sanitari)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nome TEXT NOT NULL,
      cognome TEXT NOT NULL,
      ruolo TEXT DEFAULT 'medico',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Tabella pazienti
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codice_fiscale TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      cognome TEXT NOT NULL,
      data_nascita DATE NOT NULL,
      sesso TEXT CHECK(sesso IN ('M', 'F')) NOT NULL,
      telefono TEXT,
      email TEXT,
      indirizzo TEXT,
      citta TEXT,
      cap TEXT,
      provincia TEXT,
      medico_curante TEXT,
      note_generali TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrazione: Aggiungi colonna citta_nascita se non esiste
  db.run(`ALTER TABLE patients ADD COLUMN citta_nascita TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Errore nell\'aggiungere colonna citta_nascita:', err.message);
    } else if (!err) {
      console.log('✅ Colonna citta_nascita aggiunta alla tabella patients');
    }
  });

  // Tabella visite mediche
  db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      data_visita DATETIME NOT NULL,
      tipo_visita TEXT NOT NULL,
      motivo TEXT,
      anamnesi TEXT,
      esame_obiettivo TEXT,
      diagnosi TEXT,
      terapia TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Tabella esami/risultati
  db.run(`
    CREATE TABLE IF NOT EXISTS examinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      tipo_esame TEXT NOT NULL,
      descrizione TEXT,
      risultato TEXT,
      valori_normali TEXT,
      data_esame DATE NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    )
  `);

  // Tabella parametri vitali
  db.run(`
    CREATE TABLE IF NOT EXISTS vital_signs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      pressione_sistolica INTEGER,
      pressione_diastolica INTEGER,
      frequenza_cardiaca INTEGER,
      temperatura REAL,
      peso REAL,
      altezza REAL,
      saturazione_ossigeno INTEGER,
      glicemia INTEGER,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    )
  `);

  console.log('📋 Tabelle database inizializzate correttamente');
});

module.exports = db;
