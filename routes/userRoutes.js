// routes/userRoutes.js
const express = require('express');
const router = express.Router();

import authGuard from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { 
    registerUser,
    loginUser,
    getAllUser,
    getUserById,
    getCurrentUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const { validateRegistration, validateLogin } = require('../middlewares/validation');

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.put('/:id', upload.single('file'), updateUser);
router.get('/', getAllUser);
router.get('/me', authGuard, getCurrentUser);
router.get('/:id', adminOnly, authGuard, getUserById);
router.delete('/:id', deleteUser);

module.exports = router;