const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const testDataRoutes = require('./routes/testData');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

//API routes go here


//Serve Vite build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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