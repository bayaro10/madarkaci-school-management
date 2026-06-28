const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { loadData, saveData, isVercel } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'assets');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = (req.body.filename || ('upload-' + Date.now())).replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, name + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, path: 'assets/' + req.file.filename });
});

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
    res.json({ status: 'online', uptime: Math.floor(process.uptime()) + 's', database: 'error', error: err.message, timestamp: new Date().toISOString() });
  }
});

app.get('/api/db', async (req, res) => {
  try {
    const data = await loadData();
    if (data) return res.json(data);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`School Management System ready at http://0.0.0.0:${PORT}`);
  console.log(`Mode: Local File`);
});

module.exports = app;
