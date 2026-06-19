const fs = require('fs').promises;
const path = require('path');

const LOCAL_DB = path.join(__dirname, 'school_db.json');

let vercelKV;
let isVercel = false;

const hasKVCredentials = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

if (hasKVCredentials) {
  try {
    vercelKV = require('@vercel/kv');
    isVercel = true;
  } catch (err) {
    console.warn('Vercel KV package not available, running in local mode.');
  }
} else {
  console.log('No Vercel KV credentials found, running in local file mode.');
}

const KV_KEY = 'mms:school_db';

async function loadData() {
  if (isVercel && vercelKV) {
    try {
      const raw = await vercelKV.get(KV_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.error('Vercel KV load error:', err);
    }
  }

  try {
    const fileData = await fs.readFile(LOCAL_DB, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    return null;
  }
}

async function saveData(data) {
  if (isVercel && vercelKV) {
    try {
      await vercelKV.set(KV_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Vercel KV save error:', err);
      return false;
    }
  }

  try {
    await fs.writeFile(LOCAL_DB, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('File save error:', err);
    return false;
  }
}

module.exports = {
  isVercel,
  loadData,
  saveData
};
