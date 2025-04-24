// controllers/genreController.js
const { Genre } = require("../models");

const getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll();

    if (genres.length === 0) {
      return res.json({ success: true, data: [], message: "Belum ada genre tersimpan" });
    }

    return res
      .status(200)
      .json({ success: true, data: genres });
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


const getMoviesByGenre = async (req, res) => {
  try {
    const { id } = req.params;
    // Cari Genre beserta relasi Movie
    const genre = await Genre.findByPk(id, {
      include: {
        model: Movie,
        through: { attributes: [] }
      }
    });

    if (!genre) {
      return res
        .status(404)
        .json({ success: false, message: "Genre tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: genre.Movies  // daftar movie yang berelasi
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
  getAllGenres,
  getMoviesByGenre
};