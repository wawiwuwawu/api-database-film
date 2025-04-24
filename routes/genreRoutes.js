// routes/genreRoutes.js
const express = require("express");
const router = express.Router();
const { 
    getAllGenres,
    getMoviesByGenre
 } = require("../controllers/genreController");

// GET: Ambil semua genre
router.get("/", getAllGenres);

// GET: Ambil semua movie berdasarkan genre
router.get("/:id/movies", getMoviesByGenre);

module.exports = router;