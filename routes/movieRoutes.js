const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { 
  movieValidationRules,
  movieUpdateValidationRules 
} = require("../middlewares/validation");

const {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  getMovieByIdDetail,
  getAllMoviesDetail,
  getMovieByName,
  deleteMovie
} = require("../controllers/movieController");

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

router.get("/detail", getAllMoviesDetail);
router.get("/:id/detail", getMovieByIdDetail);

router.get("/search", getMovieByName);

router.post("/", upload.single("file"), movieValidationRules, createMovie);

router.get("/", getAllMovies);

router.get("/:id", getMovieById);

router.put("/:id", upload.single("file"), movieUpdateValidationRules, updateMovie);

router.delete("/:id", deleteMovie);

module.exports = router;
