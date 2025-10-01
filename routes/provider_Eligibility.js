




// C:\sanket\New_Schema_RAG_reteival_azure_SQL\routes\provider_eligibility.js

const express = require("express");
const { checkMemberEligibility } = require("../utils/sqlDb");
const router = express.Router();

router.post("/", async (req, res) => {
  console.log("📥 Incoming provider-eligibility request:");
  console.log("📥 Headers:", req.headers);
  console.log("📥 Raw Body:", JSON.stringify(req.body, null, 2));

  try {
    let member_id, dob;
    let toolCallId = "no-id";

    // Case 1: direct curl (flat body)
    if (req.body.member_id && req.body.dob) {
      member_id = req.body.member_id;
      dob = req.body.dob;
    }
    // Case 2: Vapi tool call (nested body)
    else if (req.body.message?.toolCalls?.[0]?.function?.arguments) {
      const args = req.body.message.toolCalls[0].function.arguments;
      toolCallId = req.body.message.toolCalls[0].id || "no-id";
      const parsed = typeof args === "string" ? JSON.parse(args) : args;
      member_id = parsed.member_id;
      dob = parsed.dob;
      console.log("🛠️ Extracted from toolCalls:", { member_id, dob });
    }

    // 🚫 Validation
    if (!member_id || !dob) {
      console.warn("⚠️ Missing required fields:", { member_id, dob });
      return res.status(200).json({
        results: [
          {
            toolCallId,
            result: {
              status: "ERROR",
              message: "Member ID and Date of Birth are required."
            }
          }
        ]
      });
    }

    // 🔎 Call SQL
    const rows = await checkMemberEligibility(member_id, dob);
    console.log("📊 Raw SQL rows:", rows);
    console.log(`📊 SQL returned count=${rows?.length ?? 0}`);

    // 🚫 No rows OR Status=NotFound
    if (
      !Array.isArray(rows) ||
      rows.length === 0 ||
      rows[0].Status === "NotFound"
    ) {
      console.log("📤 Sending NOT_FOUND (no valid record returned)");
      return res.status(200).json({
        results: [
          {
            toolCallId,
            result: {
              status: "NOT_FOUND",
              message: "The member was not found. Please confirm the details."
            }
          }
        ]
      });
    }

    // ✅ Found a valid record
    const row = rows[0];
    const response = {
      status: "FOUND",
      message: `Member is eligible from ${row.EffectiveDate ?? "N/A"} to ${row.ExpirationDate ?? "N/A"} with plan ${row.PlanName ?? "N/A"}`,
      effective_date: row.EffectiveDate ?? null,
      expiration_date: row.ExpirationDate ?? null,
      plan_name: row.PlanName ?? null
    };

    console.log("📤 Sending response to Vapi:", response);
    return res.status(200).json({
      results: [
        {
          toolCallId,
          result: response
        }
      ]
    });

  } catch (err) {
    console.error("❌ Eligibility check error:", err);
    return res.status(500).json({
      results: [
        {
          toolCallId: "no-id",
          result: {
            status: "ERROR",
            message: "Internal server error"
          }
        }
      ]
    });
  }
});

module.exports = router;
