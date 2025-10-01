

// // 📄 planRagPipeline.js

// require('dotenv').config();
// const { OpenAI } = require('openai');
// const getDb = require('../utils/mongoClient');

// const openai = new OpenAI({
//   apiKey: process.env.AZURE_OPENAI_KEY,
//   baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_CHAT_DEPLOYMENT}`,
//   defaultQuery: { 'api-version': process.env.AZURE_OPENAI_CHAT_API_VERSION },
//   defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
// });

// function cosineSimilarity(vecA, vecB) {
//   const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
//   const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
//   const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
//   return dotProduct / (normA * normB);
// }

// async function answerFromPlan(planId, question) {
//   const t0 = Date.now();
//   console.log(`\n====================== 🟣 QUERY PLAN REQUEST RECEIVED ======================`);
//   console.log(`📩 Received question: "${question}" for planId: "${planId}"`);

//   // 🔹 Setup embedding client
//   const embeddingClient = new OpenAI({
//     apiKey: process.env.AZURE_OPENAI_KEY,
//     baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
//     defaultQuery: { 'api-version': process.env.AZURE_OPENAI_EMBEDDING_API_VERSION },
//     defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
//   });

//   // 🔹 Run embedding + DB query in parallel
//   const embedStart = Date.now();
//   const embeddingPromise = embeddingClient.embeddings.create({ input: question });
  
//   const retrievalStart = Date.now();
//   const db = await getDb();


//   // const collection = db.collection('embeddings');
//   // const chunksPromise = collection
//   //   .find({ planId: planId.trim() }, { projection: { embedding: 1, text: 1 } })
//   //   .sort({ chunkIndex: 1 })
//   //   .limit(100)
//   //   .toArray();

// const collection = db.collection('plandoc');
// const chunksPromise = collection
//   .find({ parent_id: planId.trim() }, { projection: { embedding: 1, chunk: 1, page_number: 1, chunk_position: 1, source_file: 1, chunk_id: 1 } })
//   .sort({ chunk_position: 1 })  // formerly chunkIndex
//   .limit(100)
//   .toArray();


//   const [embeddingResponse, chunks] = await Promise.all([embeddingPromise, chunksPromise]);

//   const embedTime = Date.now() - embedStart;
//   const retrievalTime = Date.now() - retrievalStart;

//   const questionEmbedding = embeddingResponse.data[0].embedding;
//   console.log(`🧠 Generated embedding in ${embedTime}ms.`);
//   console.log(`📦 Retrieved ${chunks.length} chunks in ${retrievalTime}ms from MongoDB for planId: ${planId}`);

//   chunks.slice(0, 3).forEach((chunk, i) => {
//     console.log(`   🔹 Chunk ${i + 1}: "${chunk.text?.slice(0, 80)}..."`);
//   });

//   // 🔹 Score chunks
//   const scoringStart = Date.now();
//   const scored = chunks.map(chunk => ({
//     ...chunk,
//     score: cosineSimilarity(chunk.embedding, questionEmbedding),
//   }));
//   const scoringTime = Date.now() - scoringStart;
//   console.log(`📊 Scored ${chunks.length} chunks in ${scoringTime}ms.`);

//   const topChunks = scored
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 3)
//     // .map(c => c.text)
//     .map(c => c.chunk)

//     .join("\n---\n");

//   // 🔹 Generate GPT answer
//   const gptStart = Date.now();
//   const completion = await openai.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant answering questions based on insurance plan documents.",
//       },
//       {
//         role: "user",
//         content: `Answer this question using the context below.\n\nContext:\n${topChunks}\n\nQuestion: ${question}`
//       }
//     ],
//     temperature: 0.3,
//   });
//   const gptTime = Date.now() - gptStart;
//   const totalTime = Date.now() - t0;

//   const finalAnswer = completion.choices[0].message.content;
//   console.log(`✅ Final Answer:\n${finalAnswer}`);
//   console.log(`⏱️ Advanced Timing Metrics:
//    • Embedding generation: ${embedTime}ms
//    • DB retrieval: ${retrievalTime}ms
//    • Cosine scoring: ${scoringTime}ms
//    • GPT completion: ${gptTime}ms
//    • ⏱️ Total pipeline: ${totalTime}ms`);

//   return finalAnswer;
// }

// module.exports = {
//   answerFromPlan,
// };





require('dotenv').config();
const { OpenAI } = require('openai');
const getDb = require('../utils/mongoClient');

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_CHAT_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_CHAT_API_VERSION },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
});

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

async function answerFromPlan(parentId, question) {
  const t0 = Date.now();
  console.log(`\n====================== 🟣 QUERY PLAN REQUEST RECEIVED ======================`);
  console.log(`📩 Received question: "${question}" for parent_id: "${parentId}"`);

  const embeddingClient = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_EMBEDDING_API_VERSION },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
  });

  const embedStart = Date.now();
  const embeddingPromise = embeddingClient.embeddings.create({ input: question });

  const db = await getDb();
  const collection = db.collection('plandoc');
  const retrievalStart = Date.now();
  const chunksPromise = collection
    .find(
      { parent_id: parentId.trim() },
      { projection: { embedding: 1, chunk: 1, page_number: 1, chunk_position: 1, source_file: 1, chunk_id: 1 } }
    )
    .sort({ chunk_position: 1 })
    .limit(100)
    .toArray();

  const [embeddingResponse, chunks] = await Promise.all([embeddingPromise, chunksPromise]);

  const embedTime = Date.now() - embedStart;
  const retrievalTime = Date.now() - retrievalStart;

  console.log(`🧠 Generated embedding in ${embedTime}ms.`);
  console.log(`📦 Retrieved ${chunks.length} chunks in ${retrievalTime}ms from MongoDB for parent_id: ${parentId}`);

  if (chunks.length === 0) {
    console.warn(`⚠️ No chunks found for parent_id=${parentId}`);
    const availableParents = await collection.distinct("parent_id");
    console.log("📄 Available parent_ids (sample):", availableParents.slice(0, 5));
  }

  chunks.slice(0, 3).forEach((chunk, i) => {
    console.log(
      `   🔹 Chunk ${i + 1}: (page ${chunk.page_number}, pos ${chunk.chunk_position}) "${chunk.chunk?.slice(0, 80)}..."`
    );
  });

  const questionEmbedding = embeddingResponse.data[0].embedding;
  const scoringStart = Date.now();
  const scored = chunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(chunk.embedding, questionEmbedding),
  }));
  const scoringTime = Date.now() - scoringStart;
  console.log(`📊 Scored ${chunks.length} chunks in ${scoringTime}ms.`);

  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(c => c.chunk)
    .join("\n---\n");

  const gptStart = Date.now();
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant answering questions based on insurance plan documents." },
      {
        role: "user",
        content: `Answer this question using the context below.\n\nContext:\n${topChunks}\n\nQuestion: ${question}`
      }
    ],
    temperature: 0.3,
  });

  const gptTime = Date.now() - gptStart;
  const totalTime = Date.now() - t0;
  const finalAnswer = completion.choices[0].message.content;

  console.log(`✅ Final Answer:\n${finalAnswer}`);
  console.log(`⏱️ Advanced Timing Metrics:
   • Embedding generation: ${embedTime}ms
   • DB retrieval: ${retrievalTime}ms
   • Cosine scoring: ${scoringTime}ms
   • GPT completion: ${gptTime}ms
   • ⏱️ Total pipeline: ${totalTime}ms`);

  return finalAnswer;
}

module.exports = { answerFromPlan };
