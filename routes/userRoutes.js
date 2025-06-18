const express = require('express');
const router = express.Router();

const authGuard     = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { 
    registerUser,
    loginUser,
    getAllUser,
    getUserById,
    getCurrentUser,
    updateUser,
    deleteUser,
    otp_emails,
    verifyOtpAndLogin
} = require('../controllers/userController');

const { validateRegistration, validateLogin } = require('../middlewares/validation');
const rateLimit = require('express-rate-limit');
const { sendOTPEmail } = require('../config/otp_email');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
  keyGenerator: (req) => req.ip,
});

const limiterPerSecond = rateLimit({
  windowMs: 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu cepat, tunggu sebentar.' },
  keyGenerator: (req) => req.ip,
});

router.use(limiter);
router.use(limiterPerSecond);

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.put('/:id', upload.single('file'), updateUser);
router.get('/', getAllUser);
router.get('/me', authGuard, getCurrentUser);
router.get('/:id', authGuard, adminOnly, getUserById);
router.delete('/:id', deleteUser);
router.post('/send-otp', otp_emails);
router.post('/verify-otp', verifyOtpAndLogin);

module.exports = router;