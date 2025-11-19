const clientPromise = require('../../lib/mongo');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getAdminSecret } = require('../../lib/settings');

async function readBody(req) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString() || '{}';
      resolve(JSON.parse(raw));
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);
    const { username = 'sa', password = 'sa' } = body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const admins = db.collection('admins');

    const admin = await admins.findOne({ username });
    if (!admin || !admin.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = await getAdminSecret();

    const token = jwt.sign(
      { username, role: 'admin' },
      secret,
      { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '2h' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error('Admin login error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

