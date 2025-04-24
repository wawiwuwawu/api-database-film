// routes/themeRoutes.js
const express = require("express");
const router = express.Router();
const { 
    getAllThemes,
    getMoviesByTheme
} = require("../controllers/themeController");

// GET: Ambil semua tema
router.get("/", getAllThemes);
// GET: Ambil semua movie berdasarkan tema
router.get("/:id/movies", getMoviesByTheme);

module.exports = router;