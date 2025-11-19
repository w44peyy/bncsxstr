async function readBody(req) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await readBody(req);
    res.setHeader('Location', '/pages/phone.html');
    return res.status(302).end();
  } catch (err) {
    console.error('Phone redirect error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


