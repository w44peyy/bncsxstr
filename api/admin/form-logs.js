const clientPromise = require('../../lib/mongo');
const { verifyAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');
    const sessions = db.collection('sessions');
    const activeWindowMs = parseInt(process.env.ACTIVE_WINDOW_MS || '10000', 10);
    const activeSince = new Date(Date.now() - activeWindowMs);

    if (req.method === 'DELETE') {
      await logs.deleteMany({});
      return res.status(200).json({ ok: true });
    }

    const limit = Math.min(
      parseInt(
        req.query?.limit || req.query?.limit === 0 ? req.query.limit : '100',
        10
      ) || 100,
      500
    );

    const sortOrder = { updatedAt: -1, createdAt: -1 };
    const [items, total] = await Promise.all([
      logs
        .find({})
        .sort(sortOrder)
        .limit(limit)
        .toArray(),
      logs.estimatedDocumentCount()
    ]);

    const uniqueIps = Array.from(
      new Set(items.map(item => item.ip).filter(Boolean))
    );

    let onlineIpSet = new Set();
    if (uniqueIps.length > 0) {
      const onlineRecords = await sessions
        .find(
          {
            ip: { $in: uniqueIps },
            lastSeen: { $gte: activeSince }
          },
          { projection: { ip: 1 } }
        )
        .toArray();
      onlineIpSet = new Set(onlineRecords.map(record => record.ip));
    }

    const serialized = items.map(item => ({
      ...item,
      id: item._id?.toString() || '',
      isOnline: item.ip ? onlineIpSet.has(item.ip) : false
    }));

    return res.status(200).json({
      logs: serialized,
      total,
      activeWindowMs
    });
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


