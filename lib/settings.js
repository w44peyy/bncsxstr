const clientPromise = require('./mongo');

let cachedSecret = null;

async function getAdminSecret() {
  if (cachedSecret) {
    return cachedSecret;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'trbinance');
  const settings = db.collection('settings');

  const entry = await settings.findOne({ key: 'adminJwtSecret' });

  if (!entry || !entry.value) {
    const err = new Error('ADMIN_SECRET_NOT_SET');
    err.code = 500;
    throw err;
  }

  cachedSecret = entry.value;
  return cachedSecret;
}

module.exports = { getAdminSecret };

