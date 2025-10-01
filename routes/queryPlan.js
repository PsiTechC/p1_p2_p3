


// // C:\sanket\RAG_reteival_azure_SQL\routes\queryPlan.js

// const express = require("express");
// const router = express.Router();
// const { findCustomerByMemberId } = require("../utils/sqlDb");
// const { answerFromPlan } = require("../services/planRagPipeline");

// router.post("/", async (req, res) => {
//   console.log("\n====================== 🟣 QUERY PLAN REQUEST RECEIVED ======================");
//   console.log("📝 Raw Request Body:", JSON.stringify(req.body, null, 2));

//   try {
//     // ✅ Parse input flexibly
//     let input = req.body;
//     if (req.body?.message?.toolCalls?.[0]?.function?.arguments) {
//       let rawArgs = req.body.message.toolCalls[0].function.arguments;
//       input = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
//     }

//     // ✅ Extract values safely
//     const planIdOrMemberId = input.plan_id || input.planId || input.member_id;
//     const question = input.question;
//     const toolCallId = req.body?.message?.toolCalls?.[0]?.id || "no-id";

//     console.log(`📩 Incoming question: ${question}`);
//     console.log(`🔑 Received planIdOrMemberId: ${planIdOrMemberId}`);

//     // 🚧 Validate input early
//     if (!planIdOrMemberId || !question) {
//       console.error("❌ Missing required plan_id or question — cannot proceed.");
//       return res.status(200).json({
//         results: [
//           { toolCallId, result: { requires_human: true, reason: "Missing plan_id or question" } }
//         ]
//       });
//     }

//     // ✅ Resolve planId (lookup if given memberID)
//     // let planId = planIdOrMemberId;
//     // if (!planIdOrMemberId.startsWith("AC-")) {
//     //   console.log("🔎 Treating as memberID — looking up in SQL...");
//     //   const customer = await findCustomerByMemberId(planIdOrMemberId);
//     //   if (customer) {
//     //     planId = customer.planId;
//     //     console.log(`👤 Found customer: ${customer.name}, resolved planId=${planId}`);
//     //   } else {
//     //     console.warn(`⚠️ No customer found for memberID=${planIdOrMemberId}`);
//     //   }
//     // }

// function normalizePlanId(planId) {
//   // Example logic, change as per your naming convention
//   return planId.replace("AC-", "PSM_").replace(/-/g, "_");
// }



// let parentId = planIdOrMemberId;
// if (!planIdOrMemberId.startsWith("PSM_")) {
//   console.log("🔎 Treating as memberID — looking up in SQL...");
//   const customer = await findCustomerByMemberId(planIdOrMemberId);
//   if (customer) {
//     parentId = normalizePlanId(customer.planId); // new helper
//     console.log(`👤 Found customer: ${customer.name}, resolved parentId=${parentId}`);
//   } else {
//     console.warn(`⚠️ No customer found for memberID=${planIdOrMemberId}`);
//   }
// }


//     if (!planId) {
//       console.error("❌ Could not resolve a valid planId");
//       return res.status(200).json({
//         results: [
//           { toolCallId, result: { requires_human: true, reason: "Could not resolve planId" } }
//         ]
//       });
//     }

//     console.log(`🔑 Final planId for embeddings lookup: ${planId}`);

//     // ✅ Fetch answer from embeddings
//     // const answer = await answerFromPlan(planId, question);
//     const answer = await answerFromPlan(parentId, question);

//     console.log(`🧠 Final Answer: ${answer}`);

//     return res.status(200).json({
//       results: [
//         { toolCallId, result: { answer, requires_human: false } }
//       ]
//     });

//   } catch (error) {
//     console.error("❌ Error in query-plan:", error);
//     return res.status(500).json({
//       results: [
//         { result: { requires_human: true, error: error.message } }
//       ]
//     });
//   }
// });

// module.exports = router;




// C:\sanket\New_Schema_RAG_reteival_azure_SQL\routes\queryPlan.js
const express = require("express");
const router = express.Router();
const { findCustomerByMemberId } = require("../utils/sqlDb");
const { answerFromPlan } = require("../services/planRagPipeline");

router.post("/", async (req, res) => {
  console.log("\n====================== 🟣 QUERY PLAN REQUEST RECEIVED ======================");
  console.log("📝 Raw Request Body:", JSON.stringify(req.body, null, 2));

  try {
    // ✅ Parse input flexibly
    let input = req.body;
    if (req.body?.message?.toolCalls?.[0]?.function?.arguments) {
      let rawArgs = req.body.message.toolCalls[0].function.arguments;
      input = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
    }

    // ✅ Extract values safely
    const planIdOrMemberId = input.plan_id || input.planId || input.member_id;
    const question = input.question;
    const toolCallId = req.body?.message?.toolCalls?.[0]?.id || "no-id";

    console.log(`📩 Incoming question: ${question}`);
    console.log(`🔑 Received planIdOrMemberId: ${planIdOrMemberId}`);

    // 🚧 Validate input early
    if (!planIdOrMemberId || !question) {
      console.error("❌ Missing required plan_id or question — cannot proceed.");
      return res.status(200).json({
        results: [
          { toolCallId, result: { requires_human: true, reason: "Missing plan_id or question" } }
        ]
      });
    }

    // ✅ Helper to normalize old planIds to parentId format
    function normalizePlanId(planId) {
      return planId.replace("AC-", "PSM_").replace(/-/g, "_");
    }

    // ✅ Resolve parentId (lookup if given memberID)
    let parentId = planIdOrMemberId;
    if (!planIdOrMemberId.startsWith("PSM_")) {
      console.log("🔎 Treating as memberID — looking up in SQL...");
      const customer = await findCustomerByMemberId(planIdOrMemberId);
      if (customer) {
        parentId = normalizePlanId(customer.planId);
        console.log(`👤 Found customer: ${customer.name}, resolved parentId=${parentId}`);
      } else {
        console.warn(`⚠️ No customer found for memberID=${planIdOrMemberId}`);
      }
    }

    if (!parentId) {
      console.error("❌ Could not resolve a valid parentId");
      return res.status(200).json({
        results: [
          { toolCallId, result: { requires_human: true, reason: "Could not resolve parentId" } }
        ]
      });
    }

    console.log(`🔑 Final parentId for embeddings lookup: ${parentId}`);

    // ✅ Fetch answer from embeddings
    const answer = await answerFromPlan(parentId, question);
    console.log(`🧠 Final Answer: ${answer}`);

    return res.status(200).json({
      results: [
        { toolCallId, result: { answer, requires_human: false } }
      ]
    });

  } catch (error) {
    console.error("❌ Error in query-plan:", error);
    return res.status(500).json({
      results: [
        { result: { requires_human: true, error: error.message } }
      ]
    });
  }
});

module.exports = router;
