const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const User = require('../models/userModel');

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

const getAllClients = expressHandler(async (req, res) => {
  const clients = await User.find({}, 'fullName accountId tier status email');
  res.json(clients.map(client => ({
    name: client.fullName,
    accountId: client.accountId,
    tier: client.tier,
    status: client.status,
    statusColor: client.status === 'Active' ? '#00FF00' : '#FF0000', // Convert to hex for Flutter
    email: client.email,
    avatar: 'assets/images/avatar1.png', // Static for now, can be dynamic later
  })));
});

const getClientDetails = expressHandler(async (req, res) => {
  const { accountId } = req.params;
  const client = await User.findOne({ accountId }, '-password -resetToken -resetTokenExpiry'); // Exclude sensitive data
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json({
    name: client.fullName,
    email: client.email,
    accountId: client.accountId,
    tier: client.tier,
    status: client.status,
    balance: client.balance,
    transactions: [], // Placeholder, implement transaction model later
  });
});

const getDashboardStats = expressHandler(async (req, res) => {
  const activeClients = await User.countDocuments({ status: 'Active' });
  const totalInvestments = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);
  res.json({
    totalActiveClients: activeClients.toString(),
    totalInvestments: totalInvestments[0]?.total.toString() || '0',
  });
});

module.exports = { signup, login, forgotPassword, resetPassword, getAllClients,getClientDetails,getDashboardStats };