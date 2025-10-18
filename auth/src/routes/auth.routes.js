const express = require('express');
const router = express.Router();
const validator = require('../middlewares/validator.middileware')
const authController = require('../controllers/auth.controller')

router.post('/register',validator.registerUserValidation,authController.registerUser)
router.post('/login',validator.loginUserValidation,authController.loginUser)

module.exports = router;
