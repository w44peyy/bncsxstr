const clientPromise = require('../lib/mongo');

const ACTIVE_WINDOW_MS = parseInt(process.env.ACTIVE_WINDOW_MS || '10000', 10);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const sessions = db.collection('sessions');

    const since = new Date(Date.now() - ACTIVE_WINDOW_MS);

    const onlineCount = await sessions.countDocuments({
      lastSeen: { $gte: since }
    });

    return res.status(200).json({ onlineCount });
  } catch (err) {
    console.error('Online API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

