const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  try {
    console.log('Attempting to connect to MongoDB with URI:', uri);
    
    const options = {
      dbName: 'offersense',
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5
    };

    console.log('Connection options:', JSON.stringify(options, null, 2));
    
    const conn = await mongoose.connect(uri, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
    console.log(`User: ${conn.connection.user}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Error details:', error);
    console.error('Connection URI:', uri);
    console.error('Please check your MongoDB Atlas configuration:');
    console.error('1. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('2. Check your MongoDB URI in .env file');
    console.error('3. Ensure your network allows connections to MongoDB Atlas');
    console.error('4. Check if the cluster is running in MongoDB Atlas');
    console.error('5. Verify your network connection and DNS settings');
    console.error('6. Verify your MongoDB Atlas username and password');
    console.error('7. Try resetting your MongoDB Atlas password');
    process.exit(1);
  }
};

module.exports = connectDB; 