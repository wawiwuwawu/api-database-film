const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
    getAllThemes,
    getMoviesByTheme
} = require("../controllers/themeController");


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
router.get("/", getAllThemes);
router.get("/:id/movies", getMoviesByTheme);

module.exports = router;