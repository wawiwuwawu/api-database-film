// controllers/themeController.js
const { Theme } = require("../models");

const getAllThemes = async (req, res) => {
  try {
    const theme = await theme.findAll();

    if (theme.length === 0) {
      return res.json({ success: true, data: [], message: "Belum ada theme tersimpan" });
    }

    return res
      .status(200)
      .json({ success: true, data: theme });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      }
    });
  }
};

const getMoviesByTheme = async (req, res) => {
  try {
    const { id } = req.params;
    // Cari Theme beserta relasi Movie
    const theme = await theme.findByPk(id, {
      include: {
        model: Movie,
        through: { attributes: [] }
      }
    });

    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: theme.Movies
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      }
    });
  }
};

module.exports = { 
  getAllThemes,
  getMoviesByTheme
  };