require('dotenv').config();
const express = require('express');
const cors = require('cors');
const otpRoutes = require('./routes/otp');

const app = express();

app.use(cors());
app.use(express.json());

// Mount the OTP routes
app.use('/api/otp', otpRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 