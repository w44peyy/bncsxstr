const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

let clientPromise;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {
    maxPoolSize: 5
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;

