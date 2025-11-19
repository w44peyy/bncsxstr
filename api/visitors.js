const clientPromise = require('../lib/mongo');
const { verifyAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const sessions = db.collection('sessions');
    const activeWindowMs = parseInt(process.env.ACTIVE_WINDOW_MS || '10000', 10);
    const now = new Date();
    const activeSince = new Date(now.getTime() - activeWindowMs);

    const rawVisitors = await sessions
      .find({}, { projection: { _id: 0, ip: 1, lastSeen: 1 } })
      .sort({ lastSeen: -1 })
      .limit(parseInt(process.env.VISITOR_LIMIT || '100', 10))
      .toArray();

    // Her visitor için formLogs'tan page bilgisini al
    const formLogs = db.collection('formLogs');
    const visitorIps = rawVisitors.map(v => v.ip).filter(Boolean);
    
    let pageMap = {};
    if (visitorIps.length > 0) {
      const logEntries = await formLogs
        .find(
          { ip: { $in: visitorIps } },
          { projection: { ip: 1, page: 1 } }
        )
        .toArray();
      
      pageMap = logEntries.reduce((acc, log) => {
        if (log.ip && log.page) {
          acc[log.ip] = log.page;
        }
        return acc;
      }, {});
    }

    const visitors = rawVisitors.map(visitor => ({
      ...visitor,
      isOnline: visitor.lastSeen ? visitor.lastSeen >= activeSince : false,
      page: visitor.ip ? (pageMap[visitor.ip] || null) : null
    }));

    const totalCount = await sessions.estimatedDocumentCount();

    return res.status(200).json({
      totalCount,
      activeWindowMs,
      serverTime: now.toISOString(),
      visitors
    });
  } catch (err) {
    if (err.code === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 500) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    console.error('Visitors API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

