const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const otpRoutes = require('./routes/otp');
const cardRoutes = require('./routes/cards');
const offerRoutes = require('./routes/offers');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-phone-number']
  }));
} else {
  // More permissive CORS in development
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-phone-number', 'X-Requested-With', 'Accept']
  }));
}

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/otp', otpRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/offers', offerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});