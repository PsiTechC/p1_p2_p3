


// // File: services/vectorStore.js
// // This implementation uses Supabase with pgvector

// const { createClient } = require('@supabase/supabase-js');
// const { OpenAI } = require('openai');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// const TABLE_NAME = 'plan_embeddings';

// // Create vector embedding using OpenAI
// async function createEmbedding(text) {
//   console.log("📡 Creating embedding for text:", text.slice(0, 100));
//   const response = await openai.embeddings.create({
//     model: 'text-embedding-3-small',
//     input: text
//   });
//   const embedding = response.data[0].embedding;
//   console.log("✅ Embedding created (length:", embedding.length, ")");
//   return embedding;
// }

// // Store or retrieve from Supabase
// async function queryEmbeddingStore(action, payload) {
//   console.log(`🧪 Running queryEmbeddingStore with action: ${action}`);

//   if (action === 'insert') {
//     const { id, planId, embedding, text } = payload;
//     console.log("📥 Inserting embedding into Supabase for planId:", planId);
//     const { error } = await supabase.from(TABLE_NAME).insert({
//       id,
//       plan_id: planId,
//       embedding,
//       content: text
//     });
//     if (error) {
//       console.error("❌ Insert error:", error);
//       throw error;
//     }
//     console.log("✅ Insert successful");
//     return;
//   }

//   // if (action === 'search') {
//   //   const { query, filter } = payload;
//   //   console.log("🔍 Searching vector store for query:", query);
//   //   const embedding = await createEmbedding(query);

//   //   const { data, error } = await supabase.rpc('match_plan_chunks', {
//   //     query_embedding: embedding,
//   //     match_count: 5,
//   //     filter_plan_id: filter.planId
//   //   });

//   //   if (error) {
//   //     console.error("❌ Supabase RPC Error:", error);
//   //     throw error;
//   //   }

//   //   if (!data || data.length === 0) {
//   //     console.warn("⚠️ No matches returned from vector DB for:", query);
//   //   } else {
//   //     console.log("🔎 Vector DB Matches:");
//   //     data.forEach((row, i) => {
//   //       console.log(`  [${i + 1}]`, row.content.slice(0, 200));
//   //     });
//   //   }

//   //   return data.map(row => ({ text: row.content, score: row.similarity }));
//   // }

// if (action === 'search') {
//   const { query, filter } = payload;
//   console.log("🔍 Searching vector store for query:", query);
//   console.log("📎 Plan filter:", filter.planId);

//   const embedding = await createEmbedding(query);
//   console.log("📐 Embedding vector length:", embedding.length);

//   const { data, error } = await supabase.rpc('match_plan_chunks', {
//     query_embedding: embedding,
//     match_count: 5,
//     filter_plan_id: filter.planId
//   });

//   if (error) {
//     console.error("❌ Supabase RPC Error:", error);
//     throw error;
//   }

//   if (!data || data.length === 0) {
//     console.warn("⚠️ No matches returned from vector DB for:", query);
//   } else {
//     console.log("🔎 Vector DB Matches:");
//     data.forEach((row, i) => {
//       console.log(`  [${i + 1}] Score: ${row.similarity.toFixed(4)}\n  Text: ${row.content.slice(0, 200)}\n`);
//     });
//   }

//   return data.map(row => ({ text: row.content, score: row.similarity }));
// }


//   throw new Error('Unsupported action');
// }

// module.exports = { createEmbedding, queryEmbeddingStore };




const axios = require('axios');
const pdfParse = require('pdf-parse');
const crypto = require('crypto');
const { createEmbedding, queryEmbeddingStore } = require('./vectorStore');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function loadPdfFromUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const data = await pdfParse(response.data);
  return { text: data.text };
}

function chunkTextSmart(text, size = 800, overlap = 100) {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let current = '';

  for (let para of paragraphs) {
    if ((current + para).length > size) {
      chunks.push(current.trim());
      current = para.slice(-overlap);
    } else {
      current += '\n\n' + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  console.log(`📄 Total Smart Chunks: ${chunks.length}`);
  return chunks;
}

async function ingestPlanPdf(planId, pdfUrl) {
  const { text } = await loadPdfFromUrl(pdfUrl);
  const chunks = chunkTextSmart(text);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const id = crypto.createHash('md5').update(`${planId}_${i}_${chunk}`).digest('hex');
    const embedding = await createEmbedding(chunk);

    await queryEmbeddingStore('insert', {
      id,
      planId,
      embedding,
      text: chunk,
      metadata: { planId, chunkIndex: i }
    });
  }

  console.log(`✅ Ingested ${chunks.length} smart chunks for plan: ${planId}`);
}

async function answerFromPlan(planId, question) {
  console.log(`📡 [RAG] Received planId: ${planId}`);
  console.log(`📡 [RAG] Incoming question: ${question}`);

  const results = await queryEmbeddingStore('search', {
    query: question,
    filter: { planId }
  });

  if (!results || results.length === 0) {
    console.warn("⚠️ No matches found for:", question);
    return "I'm sorry, I couldn't find an answer in your plan document.";
  }

  const context = results.map((r, i) => {
    console.log(`🧩 [Chunk ${i + 1}] Score: ${r.score?.toFixed(4)} | ${r.text.slice(0, 100)}...`);
    return r.text;
  }).join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: "You are a helpful assistant answering based only on the provided insurance plan document." },
      { role: 'user', content: `${context}\n\nQ: ${question}` }
    ]
  });

  const finalAnswer = response.choices[0].message.content;
  console.log("✅ Final answer:\n", finalAnswer);
  return finalAnswer;
}

module.exports = { ingestPlanPdf, answerFromPlan };
