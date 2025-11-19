const { verifyAdmin } = require('../../lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = verifyAdmin(req);
    return res.status(200).json({ ok: true, user: payload });
  } catch (err) {
    const status = err.code || 401;
    return res.status(status).json({ error: 'Unauthorized' });
  }
};

