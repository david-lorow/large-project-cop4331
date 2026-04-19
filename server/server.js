const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') }); 
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//Error checker
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - body keys: ${Object.
  keys(req.body || {}).join(', ') || 'none'}`);
  next();
  });

//API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const resumeRoutes = require('./routes/resume');
app.use('/api/resumes', resumeRoutes);

//Serve static assets (after API routes so they take priority)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

//Catch-all for SPA client-side routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

//Serve Vite build
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 6767;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});