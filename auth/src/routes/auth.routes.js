const express = require('express');
const router = express.Router();
const validator = require('../middlewares/validator.middileware')
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/register',validator.registerUserValidation,authController.registerUser)
router.post('/login',validator.loginUserValidation,authController.loginUser)
router.get('/me',authMiddleware,authController.getCurrentUser)
router.get('/logout',authController.logOutUser)
router.get('/user/me/address',authMiddleware,authController.getUserAddress)

module.exports = router;
