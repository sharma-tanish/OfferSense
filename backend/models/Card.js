const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  cardNumber: {
    type: String,
    required: true
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

module.exports = mongoose.model('Card', CardSchema); 