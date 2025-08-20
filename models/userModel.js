const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String },
  acceptedTerms: { type: Boolean, required: true, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  balance: { type: Number, default: 0 }, // New field
  investmentStartDate: { type: Date }, // New field
});

module.exports = mongoose.model('User', userSchema);