

// // File: scripts/bulkIngestPlans.js

// require('dotenv').config();
// const mongoose = require('mongoose');
// const { ingestPlanPdf } = require('../services/planRagPipeline');

// const MONGO_URI = process.env.MONGODB_URI;
// const COLLECTION_NAME = 'user_member_ids';

// async function connectToMongo() {
//   await mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });
//   console.log('✅ Connected to MongoDB');
// }

// async function fetchPlansToIngest() {
//   const Plan = mongoose.model(
//     'MemberPlan',
//     new mongoose.Schema({
//       planId: String,
//       planPdfUrl: String
//     }),
//     COLLECTION_NAME // ✅ points to 'memberId_plans_mapping'
//   );

//   return await Plan.find({ planPdfUrl: { $ne: null } }); // ✅ only fetch documents with planPdfUrl
// }

// async function bulkIngest() {
//   await connectToMongo();
//   const plans = await fetchPlansToIngest();

//   console.log(`📦 Found ${plans.length} plans to ingest`);

//   for (const plan of plans) {
//     try {
//       console.log(`\n➡️ Ingesting: ${plan.planId}`);
//       await ingestPlanPdf(plan.planId, plan.planPdfUrl);
//     } catch (err) {
//       console.error(`❌ Failed to ingest ${plan.planId}:`, err.message);
//     }
//   }

//   console.log('\n✅ Done ingesting all plans.');
//   mongoose.disconnect();
// }

// bulkIngest();


// File: scripts/bulkIngestPlans.js

require('dotenv').config();
const mongoose = require('mongoose');
const { ingestPlanPdf } = require('../services/planRagPipeline');

const MONGO_URI = process.env.MONGODB_URI;
const COLLECTION_NAME = 'user_member_ids';

async function connectToMongo() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB');
}

async function fetchPlansToIngest() {
  const Plan = mongoose.model(
    'MemberPlan',
    new mongoose.Schema({
      planId: String,
      planPdfUrl: String
    }),
    COLLECTION_NAME
  );

  return await Plan.find({ planPdfUrl: { $ne: null } });
}

async function bulkIngest() {
  await connectToMongo();
  const plans = await fetchPlansToIngest();

  console.log(`📦 Found ${plans.length} plans to ingest`);

  for (const plan of plans) {
    try {
      console.log(`\n➡️ Ingesting: ${plan.planId}`);
      await ingestPlanPdf(plan.planId, plan.planPdfUrl);
    } catch (err) {
      console.error(`❌ Failed to ingest ${plan.planId}:`, err.message);
    }
  }

  console.log('\n✅ Done ingesting all plans.');
  mongoose.disconnect();
}

bulkIngest();

