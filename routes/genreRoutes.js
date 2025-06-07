const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
    getAllGenres,
    getMoviesByGenre
 } = require("../controllers/genreController");

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
  max: 1, // max 1 request per detik
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu cepat, tunggu sebentar.' },
  keyGenerator: (req) => req.ip,
});

router.use(limiter);
router.use(limiterPerSecond);

router.get("/", getAllGenres);

router.get("/:id/movies", getMoviesByGenre);

module.exports = router;