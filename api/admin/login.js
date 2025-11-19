const clientPromise = require('../../lib/mongo');
const jwt = require('jsonwebtoken');
const { getAdminSecret } = require('../../lib/settings');

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin'
};

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
    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    let panel = null;

    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'trbinance');
      const adminPanel = db.collection('adminPanel');

      panel = await adminPanel.findOne({});

      if (!panel) {
        try {
          await adminPanel.insertOne({ ...DEFAULT_ADMIN });
          panel = { ...DEFAULT_ADMIN };
        } catch (insertErr) {
          console.error('Failed to insert default admin, using fallback', insertErr);
          panel = { ...DEFAULT_ADMIN };
        }
      }
    } catch (mongoErr) {
      console.error('MongoDB connection error, using fallback credentials', mongoErr);
      panel = { ...DEFAULT_ADMIN };
    }

    if (!panel || !panel.username || !panel.password) {
      panel = { ...DEFAULT_ADMIN };
    }

    if (panel.username !== username || panel.password !== password) {
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

