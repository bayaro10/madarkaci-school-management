const fs = require('fs').promises;
const path = require('path');

// Store data OUTSIDE the git working directory so git resets never wipe user data
const PERSISTENT_DB = '/home/runner/school_data/school_db.json';
const FALLBACK_DB = path.join(__dirname, 'school_db.json');

async function ensureDir() {
  try {
    await fs.mkdir('/home/runner/school_data', { recursive: true });
  } catch (err) {
    // already exists
  }
}

async function loadData() {
  await ensureDir();
  try {
    const fileData = await fs.readFile(PERSISTENT_DB, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    // Persistent location empty — try to migrate from old location
    try {
      const fallback = await fs.readFile(FALLBACK_DB, 'utf8');
      const data = JSON.parse(fallback);
      // Migrate to persistent location immediately
      await fs.writeFile(PERSISTENT_DB, JSON.stringify(data, null, 2));
      console.log('Migrated school_db.json to persistent storage.');
      return data;
    } catch (err2) {
      return null;
    }
  }
}

async function saveData(data) {
  await ensureDir();
  try {
    await fs.writeFile(PERSISTENT_DB, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('File save error:', err);
    return false;
  }
}

module.exports = {
  isVercel: false,
  loadData,
  saveData
};
