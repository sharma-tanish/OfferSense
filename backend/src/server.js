import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import otpRoutes from './routes/otp.js';
import cardRoutes from './routes/cards.js';
import offerRoutes from './routes/offers.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

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