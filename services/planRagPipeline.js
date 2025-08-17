


// const axios = require('axios');
// const pdfParse = require('pdf-parse');
// const crypto = require('crypto');
// const { createEmbedding, queryEmbeddingStore } = require('./vectorStore');
// const { OpenAI } = require('openai');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // 1. Download and parse PDF text
// async function loadPdfFromUrl(url) {
//   const response = await axios.get(url, { responseType: 'arraybuffer' });
//   const pdfBuffer = response.data;
//   const data = await pdfParse(pdfBuffer);
//   return { text: data.text, numPages: data.numpages };
// }

// // 2. Chunk PDF text smartly using paragraph or sentence separators
// function chunkTextSmart(text, size = 800, overlap = 100) {
//   const chunks = [];
//   const paragraphs = text.split(/\n\s*\n/); // double newlines = paragraph split

//   let currentChunk = '';
//   for (let para of paragraphs) {
//     if (currentChunk.length + para.length > size) {
//       chunks.push(currentChunk.trim());
//       currentChunk = para.slice(-overlap); // overlap from end of previous para
//     } else {
//       currentChunk += '\n\n' + para;
//     }
//   }

//   if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());

//   console.log(`📄 Total Smart Chunks: ${chunks.length}`);
//   return chunks;
// }

// // 3. Ingest plan into vector DB
// async function ingestPlanPdf(planId, pdfUrl) {
//   const { text } = await loadPdfFromUrl(pdfUrl);
//   const chunks = chunkTextSmart(text);

//   for (let i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i];
//     const id = crypto.createHash('md5').update(`${planId}_${i}_${chunk}`).digest('hex');
//     const embedding = await createEmbedding(chunk);

//     await queryEmbeddingStore('insert', {
//       id,
//       planId,
//       embedding,
//       text: chunk,
//       metadata: {
//         planId,
//         chunkIndex: i
//       }
//     });
//   }

//   console.log(`✅ Ingested ${chunks.length} smart chunks for plan: ${planId}`);
// }

// // 4. Query vector DB and get answer from OpenAI
// async function answerFromPlan(planId, question) {
//   console.log(`📡 [RAG] Received planId: ${planId}`);
//   console.log(`📡 [RAG] Incoming question: ${question}`);

//   const results = await queryEmbeddingStore('search', {
//     query: question,
//     filter: { planId }
//   });

//   if (!results || results.length === 0) {
//     console.warn("⚠️ [RAG] No vector DB matches found for:", question);
//     return "I'm sorry, I couldn't find an answer in your plan document.";
//   }

//   console.log(`📚 [RAG] Using ${results.length} context chunks...`);
//   const context = results.map((r, i) => {
//     console.log(`🧩 [Chunk ${i + 1}] Score: ${r.score?.toFixed(4)} | ${r.text.slice(0, 100)}...`);
//     return r.text;
//   }).join('\n\n');

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [
//       { role: 'system', content: 'Answer using only the customer\'s health plan information below.' },
//       { role: 'user', content: `${context}\n\nQ: ${question}` }
//     ]
//   });

//   const finalAnswer = response.choices[0].message.content;
//   console.log("✅ [RAG] Final answer from OpenAI:\n", finalAnswer);
//   return finalAnswer;
// }

// module.exports = { ingestPlanPdf, answerFromPlan };


// const axios = require('axios');
// const pdfParse = require('pdf-parse');
// const crypto = require('crypto');
// // const { createEmbedding, queryEmbeddingStore } = require('./vectorStore');
// const { createEmbedding, queryEmbeddingStore } = require('../utils/embeddingUtils');
// const { OpenAI } = require('openai');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// async function loadPdfFromUrl(url) {
//   const response = await axios.get(url, { responseType: 'arraybuffer' });
//   const data = await pdfParse(response.data);
//   return { text: data.text };
// }

// function chunkTextSmart(text, size = 800, overlap = 100) {
//   const paragraphs = text.split(/\n\s*\n/);
//   const chunks = [];
//   let current = '';

//   for (let para of paragraphs) {
//     if ((current + para).length > size) {
//       chunks.push(current.trim());
//       current = para.slice(-overlap);
//     } else {
//       current += '\n\n' + para;
//     }
//   }
//   if (current.trim()) chunks.push(current.trim());

//   console.log(`📄 Total Smart Chunks: ${chunks.length}`);
//   return chunks;
// }

// async function ingestPlanPdf(planId, pdfUrl) {
//   const { text } = await loadPdfFromUrl(pdfUrl);
//   const chunks = chunkTextSmart(text);

//   for (let i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i];
//     const id = crypto.createHash('md5').update(`${planId}_${i}_${chunk}`).digest('hex');
//     const embedding = await createEmbedding(chunk);

//     await queryEmbeddingStore('insert', {
//       id,
//       planId,
//       embedding,
//       text: chunk,
//       metadata: { planId, chunkIndex: i }
//     });
//   }

//   console.log(`✅ Ingested ${chunks.length} smart chunks for plan: ${planId}`);
// }

// async function isPlanAlreadyIngested(planId) {
//   const { data, error } = await supabase
//     .from(TABLE_NAME)
//     .select('id', { count: 'exact', head: true })
//     .eq('plan_id', planId);

//   return data?.length > 0;
// }


// async function answerFromPlan(planId, question) {
//   console.log(`📡 [RAG] Received planId: ${planId}`);
//   console.log(`📡 [RAG] Incoming question: ${question}`);

//   const results = await queryEmbeddingStore('search', {
//     query: question,
//     filter: { planId }
//   });

//   if (!results || results.length === 0) {
//     console.warn("⚠️ No matches found for:", question);
//     return "I'm sorry, I couldn't find an answer in your plan document.";
//   }

//   const context = results.map((r, i) => {
//     console.log(`🧩 [Chunk ${i + 1}] Score: ${r.score?.toFixed(4)} | ${r.text.slice(0, 100)}...`);
//     return r.text;
//   }).join('\n\n');

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [
//       { role: 'system', content: "You are a helpful assistant answering based only on the provided insurance plan document." },
//       { role: 'user', content: `${context}\n\nQ: ${question}` }
//     ]
//   });

//   const finalAnswer = response.choices[0].message.content;
//   console.log("✅ Final answer:\n", finalAnswer);
//   return finalAnswer;
// }

// module.exports = { ingestPlanPdf, answerFromPlan };







// const axios = require('axios');
// const pdfParse = require('pdf-parse');
// const crypto = require('crypto');
// const { createEmbedding, queryEmbeddingStore } = require('../utils/embeddingUtils');
// const { OpenAI } = require('openai');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// async function loadPdfFromUrl(url) {
//   const response = await axios.get(url, { responseType: 'arraybuffer' });
//   const data = await pdfParse(response.data);
//   return { text: data.text };
// }

// function chunkTextSmart(text, size = 800, overlap = 100) {
//   const paragraphs = text.split(/\n\s*\n/);
//   const chunks = [];
//   let current = '';

//   for (let para of paragraphs) {
//     if ((current + para).length > size) {
//       chunks.push(current.trim());
//       current = para.slice(-overlap);
//     } else {
//       current += '\n\n' + para;
//     }
//   }

//   if (current.trim()) chunks.push(current.trim());

//   console.log(`📄 Total Smart Chunks: ${chunks.length}`);
//   return chunks;
// }

// async function ingestPlanPdf(planId, pdfUrl) {
//   const { text } = await loadPdfFromUrl(pdfUrl);
//   const chunks = chunkTextSmart(text);

//   for (let i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i];
//     const id = crypto.createHash('md5').update(`${planId}_${i}_${chunk}`).digest('hex');
//     const embedding = await createEmbedding(chunk);

//     await queryEmbeddingStore('insert', {
//       id,
//       planId,
//       embedding,
//       text: chunk,
//       metadata: { planId, chunkIndex: i }
//     });
//   }

//   console.log(`✅ Ingested ${chunks.length} smart chunks for plan: ${planId}`);
// }

// async function answerFromPlan(planId, question) {
//   console.log(`📡 [RAG] Received planId: ${planId}`);
//   console.log(`📡 [RAG] Incoming question: ${question}`);

//   const results = await queryEmbeddingStore('search', {
//     query: question,
//     filter: { planId }
//   });

//   if (!results || results.length === 0) {
//     console.warn("⚠️ No matches found for:", question);
//     return "I'm sorry, I couldn't find an answer in your plan document.";
//   }

//   const context = results.map((r, i) => {
//     console.log(`🧩 [Chunk ${i + 1}] Score: ${r.score?.toFixed(4)} | ${r.text.slice(0, 100)}...`);
//     return r.text;
//   }).join('\n\n');

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [
//       { role: 'system', content: "You are a helpful assistant answering based only on the provided insurance plan document." },
//       { role: 'user', content: `${context}\n\nQ: ${question}` }
//     ]
//   });

//   const finalAnswer = response.choices[0].message.content;
//   console.log("✅ Final answer:\n", finalAnswer);
//   return finalAnswer;
// }

// module.exports = { ingestPlanPdf, answerFromPlan };




const axios = require('axios');
const pdfParse = require('pdf-parse');
const crypto = require('crypto');
const { createEmbedding, queryEmbeddingStore } = require('../utils/embeddingUtils');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Download and parse PDF text
async function loadPdfFromUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const data = await pdfParse(response.data);
  return { text: data.text };
}

// 2. Smarter chunking with section header detection
function chunkTextSmart(text, size = 800, overlap = 100) {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let current = '';
  let section = '';

  for (let para of paragraphs) {
    const isHeader = /^[A-Z\s\d\-\.:]{5,}$/.test(para.trim());
    if (isHeader) section = para.trim();

    if ((current + para).length > size) {
      chunks.push({ text: current.trim(), section });
      current = para.slice(-overlap);
    } else {
      current += '\n\n' + para;
    }
  }
  if (current.trim()) chunks.push({ text: current.trim(), section });

  console.log(`📄 Total Smart Chunks: ${chunks.length}`);
  return chunks;
}

// 3. Ingest all chunks into vector DB
async function ingestPlanPdf(planId, pdfUrl) {
  const { text } = await loadPdfFromUrl(pdfUrl);
  const chunks = chunkTextSmart(text);

  for (let i = 0; i < chunks.length; i++) {
    const { text: chunkText, section } = chunks[i];
    const id = crypto.createHash('md5').update(`${planId}_${i}_${chunkText}`).digest('hex');
    const embedding = await createEmbedding(chunkText);

    await queryEmbeddingStore('insert', {
      id,
      planId,
      embedding,
      text: chunkText,
      metadata: { planId, chunkIndex: i, section: section || 'Unknown' }
    });
  }

  console.log(`✅ Ingested ${chunks.length} smart chunks for plan: ${planId}`);
}

// 4. Answer from plan using vector DB + optional regex fallback
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
     temperature: 0.2,
    messages: [
      { role: 'system', content: "You are a helpful assistant answering based only on the provided insurance plan document. If the answer includes deductibles, copayments, limits, or dates, be specific and precise." },
      { role: 'user', content: `${context}\n\nQ: ${question}` }
    ]
  });

  const finalAnswer = response.choices[0].message.content;
  console.log("✅ Final answer:\n", finalAnswer);
  return finalAnswer;
}

module.exports = { ingestPlanPdf, answerFromPlan };
