const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const signup = expressHandler(async (req, res) => {
  const { fullName, phoneNumber, email, password, referralCode, acceptedTerms } = req.body;
  if (!acceptedTerms) return res.status(400).json({ message: 'Must accept terms' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      referralCode,
      acceptedTerms,
    });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const login = expressHandler(async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const forgotPassword = expressHandler(async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  const text = `Your password reset OTP is: ${resetToken}. It expires in 1 hour.`;
  await sendEmail(email, 'Password Reset OTP', text); // Send email
  res.json({ message: 'Reset OTP sent to email' });
});

const resetPassword = expressHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, resetToken: otp, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

const profile = expressHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

const updateProfile = expressHandler(async (req, res) => {
  const updates = req.body;
  await User.findByIdAndUpdate(req.userId, updates);
  res.json({ message: 'Profile updated' });
});

const home = expressHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('fullName'); // Add balance and investmentStartDate fields to model if needed
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    fullName: user.fullName,
    balance: 1000.00, // Mock data, replace with actual field or calculation
    investmentStartDate: 'Jan 15, 2025', // Mock data, replace with actual field
  });
});

const deposit = expressHandler(async (req, res) => {
  // Placeholder: Implement deposit logic (e.g., update balance)
  res.json({ message: 'Deposit initiated' });
});

const withdraw = expressHandler(async (req, res) => {
  // Placeholder: Implement withdraw logic (e.g., update balance, validate)
  res.json({ message: 'Withdraw initiated' });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  profile,
  updateProfile,
  home,
  deposit,
  withdraw,
};