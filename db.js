const fs = require('fs').promises;
const path = require('path');

const LOCAL_DB = path.join(__dirname, 'school_db.json');

console.log('Running in local file mode.');

async function loadData() {
  try {
    const fileData = await fs.readFile(LOCAL_DB, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    return null;
  }
}

async function saveData(data) {
  try {
    await fs.writeFile(LOCAL_DB, JSON.stringify(data, null, 2));
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
