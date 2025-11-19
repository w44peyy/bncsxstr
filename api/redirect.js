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
    // Drain the body to avoid warnings
    await readBody(req);
    
    // Query parametresine göre yönlendirme
    const { url } = req.query || {};
    let redirectTo = '/pages/wait.html'; // Default
    
    if (url === 'phone' || url === 'phone.html') {
      redirectTo = '/pages/phone.html';
    } else if (url === 'wait' || url === 'wait.html') {
      redirectTo = '/pages/wait.html';
    }
    
    res.setHeader('Location', redirectTo);
    return res.status(302).end();
  } catch (err) {
    console.error('Redirect error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

