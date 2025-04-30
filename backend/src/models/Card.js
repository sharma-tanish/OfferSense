const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  lastFourDigits: {
    type: String,
    required: true,
    index: true
  },
  cardType: {
    type: String,
    required: true,
    enum: ['VISA', 'MASTERCARD', 'RUPAY', 'AMEX']
  },
  bankName: {
    type: String,
    required: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'deleted'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for userId and lastFourDigits, but only for active cards
cardSchema.index({ userId: 1, lastFourDigits: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'active' }
});

module.exports = mongoose.model('Card', cardSchema); 