const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  cardType: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  lastFourDigits: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add compound index for userId and cardNumber
cardSchema.index({ userId: 1, cardNumber: 1 }, { unique: true });

// Add pre-save middleware to ensure lastFourDigits is set
cardSchema.pre('save', function(next) {
  if (this.isModified('cardNumber')) {
    this.lastFourDigits = this.cardNumber.slice(-4);
  }
  next();
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card; 