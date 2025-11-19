const clientPromise = require('./mongo');

const ENV_ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || null;
const DEFAULT_ADMIN_SECRET = 'trborsm-default-admin-secret-5ac8e2cf-0df8-4d5c-9e3c-e7ead6f5b9aa';

let cachedSecret = null;

async function getAdminSecret() {
  if (cachedSecret) {
    return cachedSecret;
  }

  if (ENV_ADMIN_SECRET) {
    cachedSecret = ENV_ADMIN_SECRET;
    return cachedSecret;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const settings = db.collection('settings');

    const entry = await settings.findOne({ key: 'adminJwtSecret' });

    if (entry && entry.value) {
      cachedSecret = entry.value;
      return cachedSecret;
    }
  } catch (err) {
    console.error('Failed to read admin secret from MongoDB, using default.', err);
  }

  cachedSecret = DEFAULT_ADMIN_SECRET;
  return cachedSecret;
}

module.exports = { getAdminSecret };

