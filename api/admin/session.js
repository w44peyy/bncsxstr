const { verifyAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await verifyAdmin(req);
    return res.status(200).json({ ok: true, user: payload });
  } catch (err) {
    const status = err.code || 401;
    return res.status(status).json({ error: status === 500 ? 'Server misconfigured' : 'Unauthorized' });
  }
};

