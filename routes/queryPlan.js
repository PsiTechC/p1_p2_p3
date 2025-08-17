// // C:\sanket\BE_PLAN_ID\routes\queryPlan.js

// const express = require('express');
// const router = express.Router();
// const db = require('../utils/mockDb');

// router.post('/', async (req, res) => {
//   const toolCall = req.body?.message?.toolCalls?.[0];
//   const input = toolCall?.function?.arguments || {};
//   const plan_id = input.plan_id;
//   const question = input.question;
//   const toolCallId = toolCall?.id || 'no-id';

//   console.log('📩 Incoming question:', question);

//   const plan = await db.findPlanById(plan_id);

//   if (!plan) {
//     console.log('❌ No plan found for:', plan_id);
//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: { requires_human: true }
//         }
//       ]
//     });
//   }

//   // const match = plan.qa.find(qa =>
//   //   question.toLowerCase().includes(qa.q.toLowerCase())
//   // ); 
//   const match = plan.qa.find(qa =>
//   question.toLowerCase().includes(qa.q.toLowerCase())
//     || qa.q.toLowerCase().includes(question.toLowerCase())
// );


//   if (!match) {
//     console.log('⚠️ No match for question');
//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: { requires_human: true }
//         }
//       ]
//     });
//   }

//   return res.json({
//     results: [
//       {
//         toolCallId,
//         result: {
//           answer: match.a,
//           requires_human: false
//         }
//       }
//     ]
//   });
// });

// module.exports = router;



// // C:\sanket\BE_PLAN_ID\routes\queryPlan.js

// const express = require('express');
// const router = express.Router();
// const { answerFromPlan } = require('../services/planRagPipeline');

// router.post('/', async (req, res) => {
//   const toolCall = req.body?.message?.toolCalls?.[0];
//   const input = toolCall?.function?.arguments || {};
//   const plan_id = input.plan_id;
//   const question = input.question;
//   const toolCallId = toolCall?.id || 'no-id';

//   console.log('📩 Incoming question:', question);

//   try {
//     const answer = await answerFromPlan(plan_id, question);

//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: {
//             answer,
//             requires_human: false
//           }
//         }
//       ]
//     });
//   } catch (error) {
//     console.error('❌ Error answering from plan:', error);
//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: { requires_human: true }
//         }
//       ]
//     });
//   }
// });

// module.exports = router;




// // File: routes/queryPlan.js

// const express = require('express');
// const router = express.Router();
// const db = require('../utils/mockDb');  // ✅ Make sure this can access `findCustomer`
// const { answerFromPlan } = require('../services/planRagPipeline');

// router.post('/', async (req, res) => {
//   const toolCall = req.body?.message?.toolCalls?.[0];
//   const input = toolCall?.function?.arguments || {};
//   const plan_id = input.plan_id; // This is actually memberId
//   const question = input.question;
//   const toolCallId = toolCall?.id || 'no-id';

//   console.log('📩 Incoming question:', question);

//   try {
//     // ✅ Look up customer by member ID
//     const customer = await db.findCustomerByMemberId(plan_id);
//     if (!customer || !customer.planPdfUrl) {
//       console.warn('⚠️ No plan URL found for memberId:', plan_id);
//       throw new Error('No plan PDF found');
//     }

//     const planUrl = customer.planPdfUrl;

//     // ✅ Pass plan URL + question to RAG
//     const answer = await answerFromPlan(planUrl, question);

//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: {
//             answer,
//             requires_human: false
//           }
//         }
//       ]
//     });

//   } catch (error) {
//     console.error('❌ Error answering from plan:', error);
//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: { requires_human: true }
//         }
//       ]
//     });
//   }
// });

// module.exports = router;



// // File: routes/queryPlan.js

// const express = require('express');
// const router = express.Router();
// const db = require('../utils/mockDb');  // ✅ Access to findCustomerByMemberId
// const { answerFromPlan } = require('../services/planRagPipeline');

// router.post('/', async (req, res) => {
//   const toolCall = req.body?.message?.toolCalls?.[0];
//   const input = toolCall?.function?.arguments || {};
//   const plan_id = input.plan_id; // This is actually memberId
//   const question = input.question;
//   const toolCallId = toolCall?.id || 'no-id';
// console.log('🧾 Looking up customer by member_id:', input.member_id);

//   console.log('📩 Incoming question:', question);

//   try {
//     // ✅ Look up customer by member ID
//     // const customer = await db.findCustomerByMemberId(plan_id);
//     const customer = await db.findCustomer(questionContext.member_id || plan_id);

//     if (!customer || !customer.planPdfUrl) {
//       console.warn('⚠️ No plan URL found for memberId:', plan_id);
//       throw new Error('No plan PDF found');
//     }

//     const planUrl = customer.planPdfUrl;
//     console.log(`🔗 Using Plan PDF URL: ${planUrl}`);

//     // ✅ Pass plan URL + question to RAG
//     const answer = await answerFromPlan(planUrl, question);
//     console.log(`🧠 Answer generated: ${answer}`);

//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: {
//             answer,
//             requires_human: false
//           }
//         }
//       ]
//     });

//   } catch (error) {
//     console.error('❌ Error answering from plan:', error);
//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: { requires_human: true }
//         }
//       ]
//     });
//   }
// });

// module.exports = router;



// // File: routes/queryPlan.js

// const express = require('express');
// const router = express.Router();
// const db = require('../utils/mockDb');  // ✅ Access to findCustomerByMemberId
// const { answerFromPlan } = require('../services/planRagPipeline');

// router.post('/', async (req, res) => {
//   const toolCall = req.body?.message?.toolCalls?.[0];
//   const input = toolCall?.function?.arguments || {};
//   // const plan_id = input.plan_id; // This is actually memberId
//   const question = input.question;
//   const toolCallId = toolCall?.id || 'no-id';

//   console.log('📩 Incoming question:', question);

//   try {
//     // ✅ Look up customer by member ID
//     const customer = await db.findCustomerByMemberId(plan_id);
//     if (!customer || !customer.planPdfUrl) {
//       console.warn('⚠️ No plan URL found for memberId:', plan_id);
//       throw new Error('No plan PDF found');
//     }

//     const planUrl = customer.planPdfUrl;
//     console.log(`🔗 Using Plan PDF URL: ${planUrl}`);

//     // ✅ Pass plan URL + question to RAG
//     const answer = await answerFromPlan(planUrl, question);
//     console.log(`🧠 Answer generated: ${answer}`);

//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: {
//             answer,
//             requires_human: false
//           }
//         }
//       ]
//     });

//   } catch (error) {
//     console.error('❌ Error answering from plan:', error);
//     return res.json({
//       results: [
//         {
//           toolCallId,
//           result: { requires_human: true }
//         }
//       ]
//     });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const db = require('../utils/mockDb');
const { answerFromPlan } = require('../services/planRagPipeline');

router.post('/', async (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  const input = toolCall?.function?.arguments || {};
  const plan_id = input.plan_id;
  const question = input.question;
  const toolCallId = toolCall?.id || 'no-id';

  console.log('📩 Incoming question:', question);

  try {
    // ✅ Fetch customer first
    const customer = await db.findCustomerByMemberId(plan_id);

    if (!customer || !customer.planPdfUrl || !customer.planId) {
      console.warn('⚠️ No plan info found for memberId:', plan_id);
      throw new Error('No plan info available');
    }

    // ✅ Now safely access customer
    const planId = customer.planId;
    console.log(`👤 Verified: ${customer.name} | Plan ID: ${planId}`);

    const answer = await answerFromPlan(planId, question);
    console.log(`🧠 Final Answer: ${answer}`);

    return res.json({
      results: [
        {
          toolCallId,
          result: {
            answer,
            requires_human: false
          }
        }
      ]
    });

  } catch (error) {
    console.error('❌ Error in query-plan:', error.message);
    return res.json({
      results: [
        {
          toolCallId,
          result: { requires_human: true }
        }
      ]
    });
  }
});

module.exports = router;
