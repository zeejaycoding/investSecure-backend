const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const signup = expressHandler(async (req, res) => {
  const { fullName, phoneNumber, email, password, acceptedTerms } = req.body;
  if (!acceptedTerms) return res.status(400).json({ message: 'Must accept terms' });

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      acceptedTerms,
    });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const login = expressHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, admin: { fullName: admin.fullName, email: admin.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const forgotPassword = expressHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
  admin.resetToken = resetToken;
  admin.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await admin.save();

  const text = `Your password reset OTP is: ${resetToken}. It expires in 1 hour.`;
  await sendEmail(email, 'Password Reset OTP', text); // Send email
  res.json({ message: 'Reset OTP sent to email' });
});

const resetPassword = expressHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const admin = await Admin.findOne({ email, resetToken: otp, resetTokenExpiry: { $gt: Date.now() } });
  if (!admin) return res.status(400).json({ message: 'Invalid or expired OTP' });

  admin.password = await bcrypt.hash(newPassword, 10);
  admin.resetToken = undefined;
  admin.resetTokenExpiry = undefined;
  await admin.save();
  res.json({ message: 'Password reset successful' });
});

module.exports = { signup, login, forgotPassword, resetPassword };