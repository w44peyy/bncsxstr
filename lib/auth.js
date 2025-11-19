const jwt = require('jsonwebtoken');

function verifyAdmin(req) {
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

  if (!process.env.ADMIN_JWT_SECRET) {
    const err = new Error('Server misconfigured');
    err.code = 500;
    throw err;
  }

  try {
    return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  } catch (error) {
    const err = new Error('UNAUTHORIZED');
    err.code = 401;
    throw err;
  }
}

module.exports = { verifyAdmin };

