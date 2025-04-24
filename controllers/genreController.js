const { Genre } = require("../models");
const { Movie } = require("../models");

const getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll();

    if (genres.length === 0) {
      return res.json({ success: true, data: [], message: "Belum ada genre tersimpan" });
    }

    return res.status(200).json({ success: true, data: genres });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const getMoviesByGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findByPk(id, {
      include: {
        model: Movie,
        through: { attributes: [] }
      }
    });

    if (!genre) {
      return res.status(404).json({ success: false, message: "Genre tidak ditemukan" });
    }
    
    if (genre.Movies.length === 0) {
      return res.status(404).json({ success: false, message: "Belum ada film di genre ini" });
    }

    return res.status(200).json({ success: true, data: genre.Movies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  getAllGenres,
  getMoviesByGenre
};