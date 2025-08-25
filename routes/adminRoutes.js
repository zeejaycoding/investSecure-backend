const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword, resetPassword, getAllClients,getClientDetails,getDashboardStats } = require('../controller/adminController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/all-clients', auth, getAllClients); 
router.get('/client/:accountId', auth, getClientDetails); 
router.get('/dashboard-stats', auth, getDashboardStats); 

module.exports = router;