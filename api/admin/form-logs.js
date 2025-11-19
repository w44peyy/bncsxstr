const clientPromise = require('../../lib/mongo');
const { verifyAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const limit = Math.min(
      parseInt(req.query?.limit || req.query?.limit === 0 ? req.query.limit : '100', 10) || 100,
      500
    );

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

    const items = await logs
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return res.status(200).json({ logs: items });
  } catch (err) {
    if (err.code === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 500) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    console.error('Form logs admin error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


