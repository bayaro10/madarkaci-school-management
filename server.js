const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;
const DB_FILE = path.join(__dirname, 'school_db.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware for logging requests (Moved up for better accuracy)
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[${new Date().toLocaleTimeString()}] incoming ${req.method} request to ${req.url}`);
  }
  next();
});

// Explicit routes for the web pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/system', (req, res) => {
    res.sendFile(path.join(__dirname, 'madarkaci_school_management.html'));
});

// Serve static files from the current directory (MUST come AFTER specific routes)
app.use(express.static(__dirname));

// Health check endpoint to verify server and database status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online (Local File Mode)',
    uptime: Math.floor(process.uptime()) + ' seconds',
    database: 'Local JSON File',
    timestamp: new Date().toISOString()
  });
});

// API Route to Load Data
app.get('/api/db', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    // If file doesn't exist, the frontend will use its seed data
    res.status(404).send("No database file found yet.");
  }
});

// API Route to Save Data
app.post('/api/db', async (req, res) => {
  try {
    // Create a backup of the current database before overwriting
    try {
      await fs.copyFile(DB_FILE, `${DB_FILE}.bak`);
    } catch (e) {
      // Ignore error if original file doesn't exist yet
    }

    await fs.writeFile(DB_FILE, JSON.stringify(req.body, null, 2));
    console.log(`[SUCCESS] Database synchronized and backup created.`);
    res.sendStatus(200);
  } catch (err) {
    console.error("[ERROR] Save failed:", err.message);
    res.status(500).send(err.message);
  }
});

function start() {
  try {
    app.listen(port, () => {
      console.log('-------------------------------------------');
      console.log(' SCHOOL MANAGEMENT SYSTEM READY ');
      console.log('-------------------------------------------');
      console.log(`Server running at http://localhost:${port}`);
      console.log(`Data Storage: ${DB_FILE}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();