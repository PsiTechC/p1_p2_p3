// // utils/mongoClient.js
// const { MongoClient } = require('mongodb');

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri, {
//   maxPoolSize: 10, // optional tweak
// });

// let db;

// async function getDb() {
//   if (!db) {
//     await client.connect();
//     db = client.db('test'); // <-- your database name
//     console.log("✅ MongoDB singleton connected");
//   }
//   return db;
// }

// module.exports = getDb;




// utils/mongoClient.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DBNAME || "new_schema"; // fallback if not set

const client = new MongoClient(uri, {
  maxPoolSize: 10, // optional tweak for connection pooling
});

let db;

async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);  // ✅ Use value from .env
    console.log(`✅ MongoDB singleton connected to database: ${dbName}`);
  }
  return db;
}

module.exports = getDb;
