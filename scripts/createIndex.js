// // createIndex.js
// require('dotenv').config();
// const { MongoClient } = require('mongodb');

// async function createIndex() {
//   const client = new MongoClient(process.env.MONGODB_URI);
//   await client.connect();
//   const db = client.db('test'); // use your actual DB name
//   const collection = db.collection('embeddings');

//   const result = await collection.createIndex({ planId: 1 });
//   console.log("✅ Index created:", result);

//   await client.close();
// }

// createIndex().catch(console.error);




// require('dotenv').config();
// const { MongoClient } = require('mongodb');

// async function run() {
//   const planId = "AC-RBP-7350"; // or use any plan ID you’re testing
//   const trimmedPlanId = planId.trim();

//   const client = new MongoClient(process.env.MONGODB_URI);
//   await client.connect();
//   const db = client.db('test'); // change to your actual db name if needed
//   const collection = db.collection('embeddings');

//   // 🔍 Check if index is being used
//   const explain = await collection.find(
//     { planId: trimmedPlanId },
//     { projection: { embedding: 1, text: 1 } }
//   )
//   .limit(100)
//   .sort({ chunkIndex: 1 }) // optional, ensures consistent order
//   .explain();

//   console.dir(explain.queryPlanner, { depth: null });
//   await client.close();
// }

// run();








const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY,
        AZURE_OPENAI_CHAT_DEPLOYMENT, AZURE_OPENAI_CHAT_API_VERSION,
        AZURE_OPENAI_EMBEDDING_DEPLOYMENT, AZURE_OPENAI_EMBEDDING_API_VERSION } = process.env;

const fetchJson = async (url, body) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': AZURE_OPENAI_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await r.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: r.status, body: parsed };
};

(async () => {
  console.log('[ENV] endpoint:', AZURE_OPENAI_ENDPOINT);
  console.log('[ENV] chat deployment:', AZURE_OPENAI_CHAT_DEPLOYMENT, 'api-version:', AZURE_OPENAI_CHAT_API_VERSION);
  console.log('[ENV] embed deployment:', AZURE_OPENAI_EMBEDDING_DEPLOYMENT, 'api-version:', AZURE_OPENAI_EMBEDDING_API_VERSION);

  // 1) Chat
  const chatUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_CHAT_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_CHAT_API_VERSION}`;
  const chatReq = { messages: [{ role: 'user', content: 'Say ok.' }], temperature: 0 };
  const chat = await fetchJson(chatUrl, chatReq);
  console.log('\n[CHAT] status:', chat.status, '\n[CHAT] body:', chat.body);

  // 2) Embedding
  const embUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_EMBEDDING_DEPLOYMENT}/embeddings?api-version=${AZURE_OPENAI_EMBEDDING_API_VERSION}`;
  const embReq = { input: 'hello world' };
  const emb = await fetchJson(embUrl, embReq);
  console.log('\n[EMBED] status:', emb.status, '\n[EMBED] body:', emb.body);
})();
