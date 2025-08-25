const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  relationship: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  nationalId: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: String,
  acceptedTerms: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  beneficiaries: [beneficiarySchema],
  accountId: { type: String, unique: true, default: () => `ACC${crypto.randomBytes(4).toString('hex').toUpperCase()}` }, // Dynamic ID
  tier: { type: String, enum: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'], default: 'Tier 1' }, // Investment tier
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }, // Account status
  balance: { type: Number, default: 0 }, // For transactions
});

module.exports = mongoose.model('User', userSchema);