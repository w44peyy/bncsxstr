const clientPromise = require('../lib/mongo');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const sessions = db.collection('sessions');

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'unknown';

    const now = new Date();

    await sessions.updateOne(
      { ip },
      {
        $set: {
          ip,
          lastSeen: now
        }
      },
      { upsert: true }
    );

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Ping error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

