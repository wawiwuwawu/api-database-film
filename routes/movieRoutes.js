// routes/movieRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { 
  movieValidationRules,
  movieUpdateValidationRules 
} = require("../middlewares/validation");
const {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
} = require("../controllers/movieController");

// POST   /api/movies/
router.post(
  "/",
  upload.single("file"),
  movieValidationRules,
  createMovie  
);

// GET    /api/movies/       → getAllMovies
router.get("/", getAllMovies);

// GET    /api/movies/:id    → getMovieById
router.get("/:id", getMovieById);

// PUT    /api/movies/:id    → updateMovie (dengan upload cover)
router.put(
  "/:id",
  upload.single("cover"),          // sama seperti create
  movieUpdateValidationRules,
  updateMovie
);

// DELETE /api/movies/:id    → deleteMovie
router.delete("/:id", deleteMovie);

module.exports = router;
