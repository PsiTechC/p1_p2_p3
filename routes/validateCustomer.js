



// C:\sanket\RAG_reteival_azure_SQL\routes\validateCustomer.js

const express = require('express');
const router = express.Router();
const { findCustomerByMemberId } = require('../utils/sqlDb');
const stringSimilarity = require('string-similarity');

// 🔧 Utility: Normalize date without UTC shifting
function normalizeDate(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ✅ Health check route
router.get('/', (req, res) => {
  return res.status(200).json({ status: "ok", message: "✅ validate-customer endpoint is live" });
});

router.post('/', async (req, res) => {
  try {
    console.log("\n====================== 🟢 VALIDATE CUSTOMER REQUEST RECEIVED ======================");
    console.log("📝 Raw Request Body:", JSON.stringify(req.body, null, 2));

    // 📥 Extract input
    let input = req.body;
    let toolCallId = null;
    if (req.body?.message?.toolCalls?.[0]?.function?.arguments) {
      toolCallId = req.body.message.toolCalls[0].id || null;
      input = req.body.message.toolCalls[0].function.arguments;
      input = typeof input === "string" ? JSON.parse(input) : input;
    }

    // 🧹 Normalize inputs
    const name = input?.name?.trim();
    const dob = input?.dob?.trim();
    const memberId = String(input?.member_id || "").replace(/\D/g, ""); // keep only digits
    const givenAddress = input?.address ? input.address.toLowerCase().trim() : "";

    console.log(`🔍 Validating memberID=${memberId}, name="${name}", dob=${dob}`);

    // 🚫 Input validation
    if (!name || !dob || !memberId) {
      console.warn("⚠️ Missing required fields: name, dob, or member_id");
      return sendVerificationResult(res, toolCallId, { status: "NOT VERIFIED" });
    }

    // 🔎 Lookup customer
    const customer = await findCustomerByMemberId(memberId);
    if (!customer) {
      console.warn(`🚫 No record found for memberID=${memberId}`);
      return sendVerificationResult(res, toolCallId, { status: "NOT VERIFIED" });
    }

    // 🧾 Log stored values for debugging
    console.log(`🗄 Stored Name: ${customer.name}`);
    console.log(`🗄 Stored DOB: ${customer.dob}`);
    console.log(`🗄 Stored Address: ${customer.address}`);

    // 🔠 Compare values
    const fullName = (customer.name || "").toLowerCase().trim();
    const givenName = name.toLowerCase().trim();
    const nameSimilarity = stringSimilarity.compareTwoStrings(fullName, givenName);

    // const storedDob = normalizeDate(customer.dob);
    // const givenDob = normalizeDate(dob);

 function normalizeDate(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const storedDob = normalizeDate(customer.dob);
const givenDob = normalizeDate(dob);

console.log(`📅 Stored DOB: "${storedDob}" | Given DOB: "${givenDob}" | Match: ${storedDob === givenDob}`);


    const storedAddress = (customer.address || "").toLowerCase().trim();
    const addressSimilarity = storedAddress && givenAddress
      ? stringSimilarity.compareTwoStrings(storedAddress, givenAddress)
      : null;

    // 🧠 Log matches
    console.log(`🔎 Name similarity: ${nameSimilarity}`);
    console.log(`📅 Stored DOB: ${storedDob} | Given DOB: ${givenDob} | Match: ${storedDob === givenDob}`);
    if (addressSimilarity !== null) console.log(`🏠 Address similarity: ${addressSimilarity}`);

    // ✅ Verification logic
    const isNameOK = nameSimilarity >= 0.8;
    const isDobOK = storedDob === givenDob;
    const isAddressOK = !addressSimilarity || addressSimilarity >= 0.65; // more tolerant

    const isVerified = isNameOK && isDobOK && isAddressOK;

    if (isVerified) {
      return sendVerificationResult(res, toolCallId, {
        status: "VERIFIED",
        plan_id: customer.planId || customer.PlanName // fallback to PlanName
      });
    }

    return sendVerificationResult(res, toolCallId, { status: "NOT VERIFIED" });

  } catch (err) {
    console.error("❌ Error validating customer:", err);
    return sendVerificationResult(res, null, { status: "NOT VERIFIED" });
  }
});

// 🔁 Response formatter
function sendVerificationResult(res, toolCallId, result) {
  const responseBody = toolCallId
    ? { results: [{ toolCallId, result }] }
    : result;

  console.log("📤 Final Response:", responseBody);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).json(responseBody);
}

module.exports = router;
