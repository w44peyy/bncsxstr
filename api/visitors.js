const clientPromise = require('../lib/mongo');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const sessions = db.collection('sessions');

    const visitors = await sessions
      .find({}, { projection: { _id: 0, ip: 1, lastSeen: 1 } })
      .sort({ lastSeen: -1 })
      .limit(parseInt(process.env.VISITOR_LIMIT || '100', 10))
      .toArray();

    const totalCount = await sessions.estimatedDocumentCount();

    return res.status(200).json({
      totalCount,
      visitors
    });
  } catch (err) {
    console.error('Visitors API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

