const express = require("express");
const router = express.Router();
const { 
  createStaffValidationRules,
  updateStaffValidationRules 
} = require("../middlewares/validation");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  getAllStaffMovie,
  getStaffMovieById,
  getStaffByName,
  deleteStaff
} = require('../controllers/staffController');
const rateLimit = require('express-rate-limit');

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

router.get("/movie", getAllStaffMovie);
router.get("/:id/movie", getStaffMovieById);

router.get("/search", getStaffByName);

router.post("/", upload.single('file'), createStaffValidationRules, createStaff);

router.get("/", getAllStaff);

router.get("/:id", getStaffById);

router.put("/:id", upload.single('file'), updateStaffValidationRules, updateStaff);

router.delete("/:id", deleteStaff);

module.exports = router;