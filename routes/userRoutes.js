const express=require('express');
const {signup,login, profile, forgotPassword, resetPassword,
  updateProfile,
  home,
  deposit,
  withdraw}=require('../controller/userController');
const auth=require('../middleware/auth');

const router=express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);
router.get('/profile', auth, profile);
router.post('/updateProfile',auth,updateProfile);
router.get('/profile', auth, profile); // Protected
router.get('/home', auth, home); // Protected
router.post('/deposit', auth, deposit); // Protected
router.post('/withdraw', auth, withdraw); // Protected

module.exports = router;