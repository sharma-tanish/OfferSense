const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  cardType: {
    type: String,
    enum: ['VISA', 'MASTERCARD', 'RUPAY'],
    required: true
  },
  cardName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
CardSchema.index({ userId: 1, cardNumber: 1 });

module.exports = mongoose.model('Card', CardSchema); 