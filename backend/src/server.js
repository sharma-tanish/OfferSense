require('dotenv').config();
// Verify OpenAI key is loaded
console.log('OpenAI Key Loaded:', !!process.env.OPENAI_API_KEY);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const otpRoutes = require('./routes/otp');
const cardRoutes = require('./routes/cards');
const offersRoutes = require('./routes/offers');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://your-other-system-ip:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

app.use(express.json());

// Routes
app.use('/api/otp', otpRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/offers', offersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server error' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});