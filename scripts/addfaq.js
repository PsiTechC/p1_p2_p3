require('dotenv').config();
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  memberId: String,
  planId: String,
  planDetails: {
    qa: [{ q: String, a: String }]
  }
}, { collection: 'memberId_plans_mapping' });

const Plan = mongoose.model('Plan', planSchema);

async function insertFAQs() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Plan.create({
    memberId: "1525",
    planId: "AC-RBP-7350",
    planDetails: {
      qa: [
        {
          q: "deductible",
          a: "The in-network individual deductible is $7,350 per year. For families, it’s $14,700."
        },
        {
          q: "emergency",
          a: "Emergency care is covered regardless of network status. Submit your claim for reimbursement."
        },
        {
          q: "therapy",
          a: "Outpatient mental health therapy requires pre-certification. I can help with that."
        },
        {
          q: "surgery",
          a: "Surgeries are covered if pre-certification is completed. Deductible and coinsurance still apply."
        },
        {
          q: "specialist",
          a: "Yes, you are covered. But out-of-network care may involve balance billing and higher cost-sharing."
        }
      ]
    }
  });

  console.log("✅ FAQs inserted");
  mongoose.disconnect();
}

insertFAQs();
