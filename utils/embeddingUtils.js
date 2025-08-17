// const { OpenAI } = require('openai');
// const { createClient } = require('@supabase/supabase-js');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// const TABLE_NAME = 'plan_embeddings';

// async function createEmbedding(text) {
//   const response = await openai.embeddings.create({
//     model: 'text-embedding-3-small',
//     input: text
//   });
//   return response.data[0].embedding;
// }

// async function queryEmbeddingStore(action, payload) {
//   if (action === 'insert') {
//     const { id, planId, embedding, text, metadata } = payload;
//     const { error } = await supabase.from(TABLE_NAME)
//       .upsert(
//         {
//           id,
//           plan_id: planId,
//           embedding,
//           content: text,
//           metadata: metadata || null
//         },
//         { onConflict: 'id' }
//       );

//     if (error) {
//       console.error('❌ Supabase insert error:', error);
//       throw error;
//     }
//     return;
//   }

//   if (action === 'search') {
//     const { query, filter } = payload;
//     const embedding = await createEmbedding(query);
//     const { data, error } = await supabase.rpc('match_plan_chunks', {
//       query_embedding: embedding,
//       match_count: 5,
//       filter_plan_id: filter.planId
//     });
//     if (error) {
//       console.error('❌ Supabase search error:', error);
//       throw error;
//     }
//     return data.map(row => ({
//       text: row.content,
//       score: row.similarity
//     }));
//   }

//   throw new Error("Unsupported action");
// }

// module.exports = { createEmbedding, queryEmbeddingStore };



const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLE_NAME = 'plan_embeddings';

async function createEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text
  });
  return response.data[0].embedding;
}

async function queryEmbeddingStore(action, payload) {
  if (action === 'insert') {
    const { id, planId, embedding, text, metadata } = payload;
    const { error } = await supabase.from(TABLE_NAME)
      .upsert(
        {
          id,
          plan_id: planId,
          embedding,
          content: text,
          metadata: metadata || null
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }
    return;
  }

  if (action === 'search') {
    const { query, filter } = payload;
    const embedding = await createEmbedding(query);
    const { data, error } = await supabase.rpc('match_plan_chunks', {
      query_embedding: embedding,
      match_count: 5,
      filter_plan_id: filter.planId
    });
    if (error) {
      console.error('❌ Supabase search error:', error);
      throw error;
    }
    return data.map(row => ({
      text: row.content,
      score: row.similarity
    }));
  }

  throw new Error("Unsupported action");
}

module.exports = { createEmbedding, queryEmbeddingStore };
