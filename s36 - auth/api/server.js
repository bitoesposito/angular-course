const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware per parsing JSON e CORS
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200', // URL dell'app Angular
  credentials: true
}));

// Importa le route di autenticazione
const authRoutes = require('./routes/auth');

// Usa le route
app.use('/api/auth', authRoutes);

// Route di test
app.get('/api/health', (req, res) => {
  res.json({ message: 'API di autenticazione funzionante', timestamp: new Date() });
});

// Gestione errori globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`🚀 Server API avviato sulla porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
