const express=require('express');
const {signup,login, profile, forgotPassword, resetPassword,updateProfile}=require('../controller/userController');
const auth=require('../middleware/auth');

const router=express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);
router.get('/profile', auth, profile);
router.post('/updateProfile',auth,updateProfile);

module.exports = router;