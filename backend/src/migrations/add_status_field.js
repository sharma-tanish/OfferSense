const mongoose = require('mongoose');
require('dotenv').config();

const Card = require('../models/Card');

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // List all indexes
    const indexes = await Card.collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // List of indexes to drop
    const indexesToDrop = [
      'cardNumber_1',
      'userId_1_cardNumber_1',
      'lastFourDigits_1',
      'token_1'  // We'll recreate this without unique constraint
    ];

    // Drop problematic indexes
    for (const indexName of indexesToDrop) {
      try {
        await Card.collection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName}`);
      } catch (error) {
        if (error.code !== 27) { // 27 is the error code for index not found
          throw error;
        }
        console.log(`Index ${indexName} not found, skipping drop`);
      }
    }

    // Update all existing cards to have status 'active'
    const result = await Card.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    console.log(`Updated ${result.modifiedCount} cards with status field`);
    
    // Create the new compound index for active cards
    await Card.collection.createIndex(
      { userId: 1, lastFourDigits: 1, status: 1 },
      { 
        unique: true,
        partialFilterExpression: { status: 'active' }
      }
    );
    console.log('Created new compound index for active cards');

    // Create non-unique indexes for other fields
    await Card.collection.createIndex({ token: 1 });
    console.log('Created non-unique token index');

    await Card.collection.createIndex({ lastFourDigits: 1 });
    console.log('Created non-unique lastFourDigits index');

    // List final indexes
    const finalIndexes = await Card.collection.indexes();
    console.log('Final indexes:', JSON.stringify(finalIndexes, null, 2));

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate(); 