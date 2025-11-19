const clientPromise = require('../lib/mongo');
const { verifyAdmin } = require('../lib/auth');

const ACTIVE_WINDOW_MS = parseInt(process.env.ACTIVE_WINDOW_MS || '10000', 10);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const sessions = db.collection('sessions');

    const since = new Date(Date.now() - ACTIVE_WINDOW_MS);

    const [onlineCount, totalCount] = await Promise.all([
      sessions.countDocuments({
        lastSeen: { $gte: since }
      }),
      sessions.estimatedDocumentCount()
    ]);

    return res.status(200).json({ onlineCount, totalCount });
  } catch (err) {
    if (err.code === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 500) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    console.error('Online API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

