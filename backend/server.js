const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`🏥 Healthboard server running on port ${PORT}`);
});
