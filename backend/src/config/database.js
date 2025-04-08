const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
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