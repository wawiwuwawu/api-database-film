const express = require("express");
const router = express.Router();
const { 
    getAllThemes,
    getMoviesByTheme
} = require("../controllers/themeController");


router.get("/", getAllThemes);
router.get("/:id/movies", getMoviesByTheme);

module.exports = router;