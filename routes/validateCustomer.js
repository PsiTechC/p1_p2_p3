const express = require('express');
const router = express.Router();
const db = require('../utils/mockDb');
console.log("✅ validateCustomer.js route loaded");
//  C:\sanket\BE_PLAN_ID\routes\validateCustomer.js
router.post('/', async (req, res) => {
  console.log("🧾 FULL REQUEST BODY:", JSON.stringify(req.body, null, 2));

  const toolCall = req.body?.message?.toolCalls?.[0];
  const input = toolCall?.function?.arguments || {};
  const name = input.name;
  const dob = input.dob;
  const member_id = input.member_id;
  const toolCallId = toolCall?.id || 'no-id';

  console.log('✅ Parsed Input:', { name, dob, member_id });

  const customer = await db.findCustomer(name, dob, member_id);

  console.log("🧾 DB Result:", customer);

  if (!customer) {
    console.log('❌ Customer not found');
    return res.json({
      results: [
        {
          toolCallId,
          result: { valid: false }
        }
      ]
    });
  }

  console.log('✅ Customer verified');

  return res.json({
    results: [
      {
        toolCallId,
        result: {
          valid: true,
          plan_id: customer.memberId
        }
      }
    ]
  });
});

module.exports = router;
