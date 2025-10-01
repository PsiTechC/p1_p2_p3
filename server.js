//C:\sanket\New_Schema_RAG_reteival_azure_SQL\server.js

require('dotenv').config(); // Load .env FIRST

const express = require('express');
const mongoose = require('mongoose');
const validateCustomer = require('./routes/validateCustomer');
const queryPlan = require('./routes/queryPlan');

// ✅ Make sure these match your actual file names exactly:
const providerEligibility = require("./routes/provider_Eligibility");
const providerClaimStatus = require("./routes/provider_ClaimStatus");

const app = express();
const PORT = process.env.PORT || 9000;
const MONGO_URI = process.env.MONGODB_URI;

console.log('📦 MONGODB_URI =', MONGO_URI);
console.log('🚪 PORT =', PORT);

// ✅ Middleware
app.use(express.json());

// ✅ Mount routes
app.use('/validate-customer', validateCustomer);
app.use('/query-plan', queryPlan);
app.use('/provider-eligibility', providerEligibility);
app.use('/provider-claim-status', providerClaimStatus);

// ✅ Root health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "✅ API server is running" });
});

// ✅ Add console logs for debugging
console.log("📡 provider-eligibility route mounted at /provider-eligibility");
console.log("📡 provider-claim-status route mounted at /provider-claim-status");

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
