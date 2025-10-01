require('dotenv').config();
const {
  SearchIndexClient,
  AzureKeyCredential
} = require('@azure/search-documents');

const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT;
const AZURE_SEARCH_ADMIN_KEY = process.env.AZURE_SEARCH_ADMIN_KEY;
const AZURE_SEARCH_INDEX_NAME = process.env.AZURE_SEARCH_INDEX_NAME;

console.log("🔧 AZURE_SEARCH_ENDPOINT:", AZURE_SEARCH_ENDPOINT);
console.log("📦 AZURE_SEARCH_INDEX_NAME:", AZURE_SEARCH_INDEX_NAME);
console.log("🔐 Admin key loaded?", AZURE_SEARCH_ADMIN_KEY ? "Yes" : "No");

const client = new SearchIndexClient(
  AZURE_SEARCH_ENDPOINT,
  new AzureKeyCredential(AZURE_SEARCH_ADMIN_KEY),
  {
    serviceVersion: "2024-05-01-preview"
  }
);

// const index = {
//   name: AZURE_SEARCH_INDEX_NAME,
//   fields: [
//     { name: 'id', type: 'Edm.String', key: true, searchable: false },
//     { name: 'planId', type: 'Edm.String', filterable: true },
//     { name: 'text', type: 'Edm.String', searchable: true },
//     {
//       name: 'embedding',
//       type: 'Collection(Edm.Single)',
//       searchable: true,
//       dimensions: 1536,
//       vectorSearchConfiguration: 'default-vector-config'
//     }
//   ],
//   vectorSearch: {
//     algorithmConfigurations: [
//       {
//         name: 'default-vector-config',
//         kind: 'hnsw',
//         parameters: {
//           metric: 'cosine',
//           m: 4,
//           efConstruction: 400,
//           efSearch: 100
//         }
//       }
//     ],
//     profiles: [
//       {
//         name: "default-profile",
//         algorithm: "default-vector-config"
//       }
//     ]
//   }
// };




// scripts/verify_azure_openai_env.js
// Verifies Azure OpenAI CHAT + EMBEDDING using your existing .env variables.
// It does NOT print your key. Requires Node 18+ (global fetch) and dotenv installed.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const {
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_KEY,
  AZURE_OPENAI_CHAT_DEPLOYMENT,
  AZURE_OPENAI_CHAT_API_VERSION,
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
  AZURE_OPENAI_EMBEDDING_API_VERSION,
} = process.env;

const trimSlash = (s) => (s || '').replace(/\/+$/, '');

function must(name, val) {
  if (!val || String(val).trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

(async () => {
  try {
    // Validate env
    const endpoint = trimSlash(must('AZURE_OPENAI_ENDPOINT', AZURE_OPENAI_ENDPOINT));
    const key = must('AZURE_OPENAI_KEY', AZURE_OPENAI_KEY);
    const chatDeployment = must('AZURE_OPENAI_CHAT_DEPLOYMENT', AZURE_OPENAI_CHAT_DEPLOYMENT).trim();
    const chatApiVer = must('AZURE_OPENAI_CHAT_API_VERSION', AZURE_OPENAI_CHAT_API_VERSION).trim();
    const embDeployment = must('AZURE_OPENAI_EMBEDDING_DEPLOYMENT', AZURE_OPENAI_EMBEDDING_DEPLOYMENT).trim();
    const embApiVer = must('AZURE_OPENAI_EMBEDDING_API_VERSION', AZURE_OPENAI_EMBEDDING_API_VERSION).trim();

    console.log('[ENV]');
    console.log(' endpoint:', endpoint);
    console.log(' chat deployment:', JSON.stringify(chatDeployment), 'api-version:', chatApiVer);
    console.log(' emb  deployment:', JSON.stringify(embDeployment),  'api-version:', embApiVer);

    // Helper to POST JSON
    async function postJson(url, body) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = text; }
      return { status: res.status, json };
    }

    // 1) Test Chat Completions
    const chatUrl = `${endpoint}/openai/deployments/${encodeURIComponent(chatDeployment)}/chat/completions?api-version=${encodeURIComponent(chatApiVer)}`;
    const chatBody = { messages: [{ role: 'user', content: 'Say OK' }], temperature: 0 };

    console.log('\n[CHAT] →', chatUrl);
    const chat = await postJson(chatUrl, chatBody);
    console.log('[CHAT] status:', chat.status);
    if (chat.status === 200) {
      const msg = chat.json?.choices?.[0]?.message?.content ?? '(no content)';
      console.log('[CHAT] reply:', JSON.stringify(msg));
    } else {
      console.log('[CHAT] error:', typeof chat.json === 'string' ? chat.json : JSON.stringify(chat.json));
    }

    // 2) Test Embeddings
    const embUrl = `${endpoint}/openai/deployments/${encodeURIComponent(embDeployment)}/embeddings?api-version=${encodeURIComponent(embApiVer)}`;
    const embBody = { input: 'hello world' };

    console.log('\n[EMBED] →', embUrl);
    const emb = await postJson(embUrl, embBody);
    console.log('[EMBED] status:', emb.status);
    if (emb.status === 200) {
      const vec = emb.json?.data?.[0]?.embedding;
      const len = Array.isArray(vec) ? vec.length : 'unknown';
      console.log('[EMBED] vector length:', len);
    } else {
      console.log('[EMBED] error:', typeof emb.json === 'string' ? emb.json : JSON.stringify(emb.json));
    }

    // Summary
    const ok = chat.status === 200 && emb.status === 200;
    console.log(`\n✅ Overall: ${ok ? 'SUCCESS' : 'FAILED'} (chat: ${chat.status}, emb: ${emb.status})`);
    if (!ok) process.exit(1);
  } catch (err) {
    console.error('❌ Setup error:', err.message);
    process.exit(1);
  }
})();
