// routes/movieRoutes.js
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
  deleteMovie
} = require("../controllers/movieController");


router.post("/", upload.single("file"), movieValidationRules, createMovie);
router.get("/", getAllMovies);
router.get("/:id", getMovieById);
router.put("/:id", upload.single("file"), movieUpdateValidationRules, updateMovie);
router.delete("/:id", deleteMovie);

module.exports = router;
