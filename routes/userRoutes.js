// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middlewares/validation');

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

module.exports = router;