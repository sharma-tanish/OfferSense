const mongoose = require('mongoose');
require('dotenv').config();

// Debug logging
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('MONGODB_URI value:', process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check your MongoDB Atlas configuration:');
    console.error('1. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('2. Check your MongoDB URI in .env file');
    console.error('3. Ensure your network allows connections to MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB; 