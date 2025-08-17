// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const validateCustomer = require('./routes/validateCustomer');
// const queryPlan = require('./routes/queryPlan');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// app.use('/validate-customer', validateCustomer);
// app.use((req, res, next) => {
//   console.log(`🔁 Incoming request: ${req.method} ${req.url}`);
//   next();
// });


// app.get('/', (req, res) => {
//   res.send('✅ VAPI backend is live!');
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const validateCustomer = require('./routes/validateCustomer');
const queryPlan = require('./routes/queryPlan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/validate-customer', validateCustomer);
app.use('/query-plan', queryPlan);

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
