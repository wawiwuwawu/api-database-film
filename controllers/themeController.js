// controllers/themeController.js
const { Theme } = require("../models");

const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll();

    if (themes.length === 0) {
      return res.json({ success: true, data: [], message: "Belum ada tema tersimpan" });
    }

    return res.status(200).json({ success: true, data: themes });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMoviesByTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await theme.findByPk(id, {
      include: {
        model: Movie,
        through: { attributes: [] }
      }
    });

    if (!theme) {
      return res.status(404).json({ success: false, message: "Theme tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: theme.Movies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  getAllThemes,
  getMoviesByTheme
  };