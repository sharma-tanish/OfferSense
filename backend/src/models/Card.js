const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  cardType: {
    type: String,
    required: true,
    enum: ['VISA', 'MASTERCARD', 'RUPAY']
  },
  bankName: {
    type: String,
    required: true
  },
  lastFourDigits: {
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
  cvv: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Card', cardSchema); 