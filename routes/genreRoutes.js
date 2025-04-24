const express = require("express");
const router = express.Router();
const { 
    getAllGenres,
    getMoviesByGenre
 } = require("../controllers/genreController");


router.get("/", getAllGenres);

router.get("/:id/movies", getMoviesByGenre);

module.exports = router;