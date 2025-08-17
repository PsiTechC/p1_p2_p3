const mongoose = require('mongoose');

const uri = 'mongodb+srv://psitech:Psitech123@pms.ijqbdmu.mongodb.net/getplan?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Define schemas
const customerSchema = new mongoose.Schema({
  name: String,
  dob: String,
  member_id: String,
  plan_id: String
});

const planSchema = new mongoose.Schema({
  id: String,
  name: String,
  qa: [{ q: String, a: String }]
});

const Customer = mongoose.model('Customer', customerSchema);
const Plan = mongoose.model('Plan', planSchema);

// ✅ Multiple customers
const customers = [
  {
    name: 'John Doe',
    dob: '1985-01-15',
    member_id: '7350-987654',
    plan_id: 'plan_7350'
  },
  {
    name: 'Sakshi',
    dob: '1999-01-01',
    member_id: '125',
    plan_id: 'plan_7350'
  },
  {
    name: 'Jane Smith',
    dob: '1992-06-10',
    member_id: '99999',
    plan_id: 'plan_7350'
  },
  {
    name: 'Amit Patel',
    dob: '1988-12-25',
    member_id: '45678',
    plan_id: 'plan_7350'
  }
];

// ✅ Reuse same plan for all for demo purposes
const plan = {
  id: 'plan_7350',
  name: 'AC RBP 7350',
  qa: [
    { q: 'deductible', a: 'In-network deductible is $7,350 per year for individual.' },
    { q: 'emergency', a: 'Emergency care is always covered regardless of network status.' },
    { q: 'surgery', a: 'Surgery requires pre-certification. Deductible and coinsurance apply.' },
    { q: 'therapy', a: 'Mental health therapy needs pre-certification beyond the first visit.' },
    { q: 'specialist', a: 'Specialist visits are covered, but out-of-network may cost more.' }
  ]
};

async function seed() {
  await Customer.deleteMany({});
  await Plan.deleteMany({});

  await Customer.insertMany(customers);
  await Plan.create(plan);

  console.log('✅ Seed complete');
  mongoose.disconnect();
}

seed();
