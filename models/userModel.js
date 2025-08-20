const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String },  // Optional
  acceptedTerms: { type: Boolean, required: true, default: false },
  resetToken: String,  // For forgot password
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);