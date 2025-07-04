const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
    saveList,
    deleteList,
    getUserList,
    updateList,
    searchListByMovieName,
    getUserListStats
} = require("../controllers/listController");

// Rate limit: 1 request per second, 30 per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 30, // max 30 request per menit
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
  keyGenerator: (req) => req.ip,
});

const limiterPerSecond = rateLimit({
  windowMs: 1000, // 1 detik
  max: 3, // max 1 request per detik
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu cepat, tunggu sebentar.' },
  keyGenerator: (req) => req.ip,
});

// Terapkan rate limit ke semua endpoint list
router.use(limiter);
router.use(limiterPerSecond);

router.post("/", saveList);
router.delete("/:userId/:movieId", deleteList);
router.put("/:userId/:movieId", updateList);
router.get("/:userId", getUserList);
router.get("/:userId/search", searchListByMovieName);
router.get('/:userId/stats', getUserListStats);

module.exports = router;