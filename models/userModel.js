const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  nationalId: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  referralCode: String,
  acceptedTerms: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  beneficiaries: [beneficiarySchema],
});

module.exports = mongoose.model('User', userSchema);