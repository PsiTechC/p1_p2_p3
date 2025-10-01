


// C:\sanket\New_Schema_RAG_reteival_azure_SQL\routes\provider_claim_status.js

const express = require("express");
const { checkProviderClaimStatus } = require("../utils/sqlDb");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", message: "✅ provider-claim-status endpoint is live" });
});

router.post("/", async (req, res) => {
  try {
    console.log("📥 Incoming provider-claim-status request:", JSON.stringify(req.body, null, 2));

    let body = req.body;
    let toolCallId = "no-id";

    // ✅ Handle nested toolCalls (Vapi)
    if (body?.message?.toolCalls?.[0]?.function?.arguments) {
      toolCallId = body.message.toolCalls[0].id || "no-id";
      let args = body.message.toolCalls[0].function.arguments;
      if (typeof args === "string") {
        try {
          body = JSON.parse(args);
        } catch (err) {
          console.error("❌ Failed to parse toolCall string:", err);
          return res.status(400).json({
            results: [{ toolCallId, result: { status: "ERROR", message: "Invalid toolCall arguments" } }]
          });
        }
      } else if (typeof args === "object") {
        body = args;
      }
    }

    const { billing_provider_tin, member_id, dob, date_of_service } = body;

    // 🚫 Validation
    if (!billing_provider_tin || !member_id || !dob) {
      return res.status(200).json({
        results: [{ toolCallId, result: { status: "ERROR", message: "TIN, Member ID and Date of Birth are required." } }]
      });
    }

    // 🔢 Normalize TIN
    const numericTIN = billing_provider_tin.replace(/\D/g, "");
    if (numericTIN.length < 9) {
      return res.status(200).json({
        results: [{ toolCallId, result: { status: "ERROR", message: "Invalid TIN. Must have at least 9 digits." } }]
      });
    }

    console.log("🔎 checkProviderClaimStatus() with:", {
      BillingProviderTIN: numericTIN,
      MemberID: member_id,
      DateOfBirth: dob,
      DateOfService: date_of_service || "N/A"
    });

    // 🔎 Query SQL
    const rows = await checkProviderClaimStatus(numericTIN, member_id, dob, date_of_service);
    console.log(`📊 SQL returned ${rows?.length ?? 0} row(s)`);
    console.log("📡 [Claim Status Recordset]", rows);

    // 🚫 No rows OR Status=NotFound
    if (!rows || rows.length === 0 || String(rows[0].Status).toLowerCase() === "notfound") {
      return res.status(200).json({
        results: [{ toolCallId, result: { status: "NOT_FOUND", message: "The claim was not found." } }]
      });
    }

    // ✅ Found record
    const { Status, DateOfService } = rows[0];
    const response = {
      status: "FOUND",
      message: `Claim status is ${Status} for date ${DateOfService ?? "N/A"}`,
      claim_status: Status,
      date_of_service: DateOfService ?? null
    };

    console.log("📤 Sending response to Vapi:", response);
    return res.status(200).json({
      results: [{ toolCallId, result: response }]
    });

  } catch (err) {
    console.error("❌ Claim status error:", err);
    return res.status(500).json({
      results: [{ toolCallId: "no-id", result: { status: "ERROR", message: "Internal server error" } }]
    });
  }
});

module.exports = router;
