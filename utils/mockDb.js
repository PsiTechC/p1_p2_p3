
// // C:\sanket\BE_PLAN_ID\utils\mockDb.js
// require('dotenv').config();
// const mongoose = require('mongoose');
// const { parse, isValid, format } = require('date-fns');

// const MONGO_URI = process.env.MONGODB_URI;

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // ✅ Customer Schema
// const customerSchema = new mongoose.Schema({
//   name: String,
//   dob: String,           // Expected in DB as "YYYY-MM-DD"
//   memberId: String
// }, { collection: 'user_member_ids' });

// const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// // ✅ Plan Schema
// const planSchema = new mongoose.Schema({
//   memberId: String,
//   planId: String,
//   planDetails: {
//     qa: [{ q: String, a: String }]
//   }
// }, { collection: 'memberId_plans_mapping' });

// const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

// // ✅ Accepted date formats for input parsing
// const acceptedFormats = [
//   'yyyy-MM-dd',
//   'MM-dd-yyyy',
//   'MM/dd/yyyy',
//   'dd-MM-yyyy',
//   'd/M/yyyy',
//   'MMMM d, yyyy',
//   'MMM d, yyyy'
// ];

// // ✅ Normalize any DOB input to 'yyyy-MM-dd'
// async function normalizeDOB(dob) {
//   for (const fmt of acceptedFormats) {
//     try {
//       const parsed = parse(dob, fmt, new Date());
//       if (isValid(parsed)) {
//         return format(parsed, 'yyyy-MM-dd');
//       }
//     } catch (_) {
//       continue;
//     }
//   }
//   return null;
// }

// // ✅ Exported methods
// module.exports = {
//   findCustomer: async (name, dob, member_id) => {
//     if (!name || !dob || !member_id) return null;

//     const normalizedDob = await normalizeDOB(dob);
//     if (!normalizedDob) {
//       console.error('❌ Failed to normalize DOB:', dob);
//       return null;
//     }

//     console.log('🔍 Normalized DOB:', normalizedDob);

//     return await Customer.findOne({
//       name: new RegExp(`^${name.trim()}$`, 'i'),
//       dob: normalizedDob,
//       memberId: member_id.trim()
//     });
//   },

//   findPlanById: async (member_id) => {
//     const doc = await Plan.findOne({ memberId: member_id });
//     if (!doc) return null;

//     return {
//       id: doc.planId,
//       qa: doc.planDetails.qa
//     };
//   }
// };



// // C:\sanket\BE_PLAN_ID\utils\mockDb.js
// require('dotenv').config();
// const mongoose = require('mongoose');
// const { parse, isValid, format } = require('date-fns');

// const MONGO_URI = process.env.MONGODB_URI;

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // ✅ Customer Schema
// const customerSchema = new mongoose.Schema({
//   name: String,
//   dob: String,           // Expected in DB as "YYYY-MM-DD"
//   memberId: String       // Expected in DB as "7350-987654"
// }, { collection: 'user_member_ids' });

// const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// // ✅ Plan Schema
// const planSchema = new mongoose.Schema({
//   memberId: String,      // Expected in DB as "7350-987654"
//   planId: String,
//   planDetails: {
//     qa: [{ q: String, a: String }]
//   }
// }, { collection: 'memberId_plans_mapping' });

// const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

// // ✅ Accepted date formats for input parsing
// const acceptedFormats = [
//   'yyyy-MM-dd',
//   'MM-dd-yyyy',
//   'MM/dd/yyyy',
//   'dd-MM-yyyy',
//   'd/M/yyyy',
//   'MMMM d, yyyy',
//   'MMM d, yyyy'
// ];

// // ✅ Normalize DOB input to 'yyyy-MM-dd'
// async function normalizeDOB(dob) {
//   for (const fmt of acceptedFormats) {
//     try {
//       const parsed = parse(dob, fmt, new Date());
//       if (isValid(parsed)) {
//         return format(parsed, 'yyyy-MM-dd');
//       }
//     } catch (_) {
//       continue;
//     }
//   }
//   return null;
// }

// // ✅ Normalize Member ID to '7350-987654' format
// function normalizeMemberId(memberId) {
//   const digitsOnly = memberId.replace(/\D/g, '');
//   if (digitsOnly.length !== 10) {
//     console.error('❌ Invalid member ID length:', memberId);
//     return null;
//   }
//   return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
// }

// // ✅ Exported methods
// module.exports = {
//   findCustomer: async (name, dob, member_id) => {
//     if (!name || !dob || !member_id) return null;

//     const normalizedDob = await normalizeDOB(dob);
//     const normalizedMemberId = normalizeMemberId(member_id);

//     if (!normalizedDob || !normalizedMemberId) {
//       console.error('❌ Failed normalization:', { dob, member_id });
//       return null;
//     }

//     console.log('🔍 Normalized DOB:', normalizedDob);
//     console.log('🔍 Normalized Member ID:', normalizedMemberId);

//     return await Customer.findOne({
//       name: new RegExp(`^${name.trim()}$`, 'i'),
//       dob: normalizedDob,
//       memberId: normalizedMemberId
//     });
//   },

//   findPlanById: async (member_id) => {
//     const normalizedMemberId = normalizeMemberId(member_id);
//     if (!normalizedMemberId) {
//       console.error('❌ Invalid member ID for plan lookup:', member_id);
//       return null;
//     }

//     const doc = await Plan.findOne({ memberId: normalizedMemberId });
//     if (!doc) return null;

//     return {
//       id: doc.planId,
//       qa: doc.planDetails.qa
//     };
//   }

  
// };


// // C:\sanket\BE_PLAN_ID\utils\mockDb.js
// require('dotenv').config();
// const mongoose = require('mongoose');
// const { parse, isValid, format } = require('date-fns');

// const MONGO_URI = process.env.MONGODB_URI;

// // 🔌 Connect to MongoDB
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // ✅ Customer Schema
// // const customerSchema = new mongoose.Schema({
// //   name: String,
// //   dob: String,           // Stored as "YYYY-MM-DD"
// //   memberId: String       // Stored as "7350-987654"
  
// // }, { collection: 'user_member_ids' });

// const customerSchema = new mongoose.Schema({
//   name: String,
//   dob: String,
//   memberId: String,
//   planPdfUrl: String, // ✅ Add this
//   planId: String      // ✅ Optional: if you want to fetch AC-RBP-xxxx
// }, 

// { collection: 'user_member_ids' });


// const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// // ✅ Plan Schema
// // const planSchema = new mongoose.Schema({
// //   memberId: String,      // Stored as "7350-987654"
// //   planId: String,
// //   planDetails: {
// //     qa: [{ q: String, a: String }]
// //   }
// // }, { collection: 'memberId_plans_mapping' });

// const planSchema = new mongoose.Schema({
//   memberId: String,
//   planId: String,
//   planPdfUrl: String, // ✅ ADD THIS LINE

// }, { collection: 'memberId_plans_mapping' });

// const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

// // ✅ Accepted input DOB formats
// const acceptedFormats = [
//   'yyyy-MM-dd',
//   'MM-dd-yyyy',
//   'MM/dd/yyyy',
//   'dd-MM-yyyy',
//   'd/M/yyyy',
//   'MMMM d, yyyy',
//   'MMM d, yyyy'
// ];

// // ✅ Normalize DOB input to 'yyyy-MM-dd'
// function normalizeDOB(dob) {
//   for (const fmt of acceptedFormats) {
//     try {
//       const parsed = parse(dob, fmt, new Date());
//       if (isValid(parsed)) {
//         return format(parsed, 'yyyy-MM-dd');
//       }
//     } catch (_) {
//       continue;
//     }
//   }
//   console.error('❌ Failed to normalize DOB:', dob);
//   return null;
// }

// // ✅ Normalize Member ID to 'xxxx-xxxxxx' format
// function normalizeMemberId(memberId) {
//   const digitsOnly = memberId.replace(/[^\d]/g, '');
//   if (digitsOnly.length !== 10) {
//     console.error('❌ Invalid member ID format:', memberId, '| Extracted digits:', digitsOnly);
//     return null;
//   }
//   return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
// }

// // ✅ Normalize name by collapsing multiple spaces
// function normalizeName(name) {
//   return name.replace(/\s+/g, ' ').trim();
// }

// // ✅ Exported methods
// async function findCustomer(name, dob, member_id) {
//   if (!name || !dob || !member_id) return null;

//   const normalizedDob = normalizeDOB(dob);
//   const normalizedMemberId = normalizeMemberId(member_id);
//   const normalizedName = normalizeName(name);

//   if (!normalizedDob || !normalizedMemberId) {
//     console.error('❌ Normalization failed:', { dob, member_id });
//     return null;
//   }

//   console.log('🔍 Normalized Name:', normalizedName);
//   console.log('🔍 Normalized DOB:', normalizedDob);
//   console.log('🔍 Normalized Member ID:', normalizedMemberId);

//   return await Customer.findOne({
//     name: new RegExp(`^${normalizedName}$`, 'i'),
//     dob: normalizedDob,
//     memberId: normalizedMemberId
//   });
// }

// // async function findPlanById(member_id) {
// //   const normalizedMemberId = normalizeMemberId(member_id);
// //   if (!normalizedMemberId) {
// //     console.error('❌ Invalid member ID for plan lookup:', member_id);
// //     return null;
// //   }

// //   const doc = await Plan.findOne({ memberId: normalizedMemberId });
// //   if (!doc) return null;

// //   // return {
// //   //   id: doc.planId,
// //   //   qa: doc.planDetails.qa
// //   // };

// //   return {
// //   id: doc.planId,
// //   qa: doc.planDetails.qa,
// //   pdfUrl: doc.planPdfUrl // ✅ ADD THIS LINE
// // };

// // }


// async function findPlanById(member_id) {
//   const normalizedMemberId = normalizeMemberId(member_id);
//   if (!normalizedMemberId) {
//     console.error('❌ Invalid member ID for plan lookup:', member_id);
//     return null;
//   }

//   const doc = await Plan.findOne({ memberId: normalizedMemberId });
//   if (!doc) {
//     console.warn('⚠️ No plan document found for member ID:', normalizedMemberId);
//     return null;
//   }

//   console.log(`📄 Found Plan: ${doc.planId} | PDF URL: ${doc.planPdfUrl}`);

//   return {
//     id: doc.planId,
//     qa: doc.planDetails.qa,
//     pdfUrl: doc.planPdfUrl
//   };
// }

// // ✅ New function to find customer using just memberId (for RAG lookup)
// async function findCustomerByMemberId(member_id) {
//   const normalizedMemberId = normalizeMemberId(member_id);
//   if (!normalizedMemberId) {
//     console.error('❌ Invalid member ID for lookup:', member_id);
//     return null;
//   }

//   const doc = await Customer.findOne({ memberId: normalizedMemberId });
//   if (!doc) {
//     console.warn('⚠️ No customer found with member ID:', normalizedMemberId);
//     return null;
//   }

//   console.log(`👤 Fetched customer via memberId: ${doc.name} | Plan URL: ${doc.planPdfUrl}`);
//   return doc;
// }


// // module.exports = {
// //   findCustomer,
// //   findPlanById,
// //   normalizeMemberId,
// //   normalizeDOB
// // };



// module.exports = {
//   findCustomer,
//   findPlanById,
//   findCustomerByMemberId, // ✅ ADD THIS
//   normalizeMemberId,
//   normalizeDOB
// };



require('dotenv').config();
const mongoose = require('mongoose');
const { parse, isValid, format } = require('date-fns');

const MONGO_URI = process.env.MONGODB_URI;

// 🔌 Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Customer Schema
const customerSchema = new mongoose.Schema({
  name: String,
  dob: String,           // Format: "YYYY-MM-DD"
  memberId: String,      // Format: "7350-987654"
  planPdfUrl: String,
  planId: String
}, { collection: 'user_member_ids' });

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// ✅ Plan Schema
const planSchema = new mongoose.Schema({
  memberId: String,
  planId: String,
  planPdfUrl: String
}, { collection: 'user_member_ids' });

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

// ✅ Accepted DOB formats
const acceptedFormats = [
  'yyyy-MM-dd',
  'MM-dd-yyyy',
  'MM/dd/yyyy',
  'dd-MM-yyyy',
  'd/M/yyyy',
  'MMMM d, yyyy',
  'MMM d, yyyy'
];

// ✅ Normalize DOB input to 'yyyy-MM-dd'
function normalizeDOB(dob) {
  for (const fmt of acceptedFormats) {
    try {
      const parsed = parse(dob, fmt, new Date());
      if (isValid(parsed)) {
        return format(parsed, 'yyyy-MM-dd');
      }
    } catch (_) {
      continue;
    }
  }
  console.error('❌ Failed to normalize DOB:', dob);
  return null;
}

// ✅ Normalize Member ID to 'xxxx-xxxxxx' format
// function normalizeMemberId(memberId) {
//   const digitsOnly = memberId.replace(/[^\d]/g, '');
//   if (digitsOnly.length !== 10) {
//     console.error('❌ Invalid member ID format:', memberId, '| Extracted digits:', digitsOnly);
//     return null;
//   }
//   return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
// }

// ✅ Normalize Member ID to 4-digit format
// function normalizeMemberId(memberId) {
//   const digitsOnly = memberId.replace(/[^\d]/g, '');
//   if (digitsOnly.length !== 4) {
//     console.error('❌ Invalid member ID format (expecting 4 digits):', memberId);
//     return null;
//   }
//   return digitsOnly;
// }


function normalizeMemberId(memberId) {
  const digitsOnly = memberId.replace(/[^\d]/g, '');  // Remove non-digits
  if (digitsOnly.length !== 4) {
    console.error('❌ Invalid member ID format (expecting 4 digits):', memberId);
    return null;
  }
  return digitsOnly;
}



// ✅ Normalize name by collapsing multiple spaces
function normalizeName(name) {
  return name.replace(/\s+/g, ' ').trim();
}

// ✅ Find customer using name, dob, and memberId
async function findCustomer(name, dob, member_id) {
  if (!name || !dob || !member_id) return null;

  const normalizedDob = normalizeDOB(dob);
  const normalizedMemberId = normalizeMemberId(member_id);
  const normalizedName = normalizeName(name);

  if (!normalizedDob || !normalizedMemberId) {
    console.error('❌ Normalization failed:', { dob, member_id });
    return null;
  }

  console.log('🔍 Normalized Name:', normalizedName);
  console.log('🔍 Normalized DOB:', normalizedDob);
  console.log('🔍 Normalized Member ID:', normalizedMemberId);

  return await Customer.findOne({
    name: new RegExp(`^${normalizedName}$`, 'i'),
    dob: normalizedDob,
    memberId: normalizedMemberId
  });
}

// ✅ Find plan using memberId
async function findPlanById(member_id) {
  const normalizedMemberId = normalizeMemberId(member_id);
  if (!normalizedMemberId) {
    console.error('❌ Invalid member ID for plan lookup:', member_id);
    return null;
  }

  const doc = await Plan.findOne({ memberId: normalizedMemberId });
  if (!doc) {
    console.warn('⚠️ No plan document found for member ID:', normalizedMemberId);
    return null;
  }

  console.log(`📄 Found Plan: ${doc.planId} | PDF URL: ${doc.planPdfUrl}`);

  return {
    id: doc.planId,
    qa: doc.planDetails?.qa ?? [],
    pdfUrl: doc.planPdfUrl
  };
}

// ✅ New function to find customer using just memberId
async function findCustomerByMemberId(member_id) {
  const normalizedMemberId = normalizeMemberId(member_id);
  if (!normalizedMemberId) {
    console.error('❌ Invalid member ID for lookup:', member_id);
    return null;
  }

  const doc = await Customer.findOne({ memberId: normalizedMemberId });
  if (!doc) {
    console.warn('⚠️ No customer found with member ID:', normalizedMemberId);
    return null;
  }

  console.log(`👤 Fetched customer via memberId: ${doc.name} | Plan URL: ${doc.planPdfUrl}`);
  return doc;
}

// ✅ Export all utilities
module.exports = {
  findCustomer,
  findPlanById,
  findCustomerByMemberId,
  normalizeMemberId,
  normalizeDOB
};
