const jwt = require('jsonwebtoken');
const { getAdminSecret } = require('./settings');

async function verifyAdmin(req) {
  const header =
    req.headers['authorization'] ||
    req.headers['Authorization'] ||
    '';

  if (!header.startsWith('Bearer ')) {
    const err = new Error('UNAUTHORIZED');
    err.code = 401;
    throw err;
  }

  const token = header.slice(7);

  try {
    const secret = await getAdminSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    const err = new Error(error.code === 500 ? 'Server misconfigured' : 'UNAUTHORIZED');
    err.code = error.code === 500 ? 500 : 401;
    throw err;
  }
}

module.exports = { verifyAdmin };

