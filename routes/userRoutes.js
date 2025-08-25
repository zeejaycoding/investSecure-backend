const express=require('express');
const {signup,login, profile, forgotPassword, resetPassword,
  updateProfile,home,deposit,withdraw, addBeneficiary,
  getBeneficiary,}=require('../controller/userController');
const auth=require('../middleware/auth');

const router=express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);
router.get('/profile', auth, profile);
router.patch('/update-profile', auth, updateProfile);
router.get('/home', auth, home); 
router.post('/deposit', auth, deposit); 
router.post('/withdraw', auth, withdraw); 
router.post('/beneficiary', auth, addBeneficiary); 
router.get('/beneficiary', auth, getBeneficiary); 

module.exports = router;