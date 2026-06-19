const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadData, saveData, isVercel } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/ping', async (req, res) => {
  try {
    const dbStatus = await loadData();
    res.json({
      status: 'online',
      uptime: Math.floor(process.uptime()) + 's',
      database: isVercel ? (dbStatus ? 'vercel-kv' : 'vercel-kv-empty') : 'local-file',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: 'online',
      uptime: Math.floor(process.uptime()) + 's',
      database: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/db', async (req, res) => {
  try {
    const data = await loadData();
    if (data) {
      return res.json(data);
    }
    res.status(404).json({ error: 'Database empty. Initialize from application.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db', async (req, res) => {
  try {
    const saved = await saveData(req.body);
    if (saved) {
      res.json({ success: true, message: 'Data saved to ' + (isVercel ? 'Vercel KV' : 'local file') });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Management System ready at http://0.0.0.0:${PORT}`);
    console.log(`Mode: ${isVercel ? 'Vercel KV' : 'Local File'}`);
  });
}

module.exports = app;
