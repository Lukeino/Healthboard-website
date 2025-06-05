const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const db = require('./database/database');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/visits', require('./routes/visits'));
app.use('/api/examinations', require('./routes/examinations'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Healthboard API is running!' });
});

// Test endpoint for patients dropdown (temporary)
app.get('/api/patients-dropdown', (req, res) => {
  const db = require('./database/database');
  const query = 'SELECT id, nome, cognome, codice_fiscale FROM patients ORDER BY cognome, nome';
  
  db.all(query, [], (err, patients) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Errore nel recupero pazienti per dropdown' 
      });
    }
    
    res.json({
      success: true,
      data: patients
    });
  });
});

app.listen(PORT, () => {
  console.log(`🏥 Healthboard server running on port ${PORT}`);
});
