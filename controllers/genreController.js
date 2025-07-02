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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const genre = await Genre.findByPk(id, {
      include: { model: Movie, as: 'movies', through: { attributes: [] } }
    });

    if (!genre) {
      return res.status(404).json({ success: false, message: "Genre tidak ditemukan" });
    }
    
    if (genre.movies.length === 0) {
      return res.status(404).json({ success: false, message: "Belum ada film di genre ini" });
    }

    const totalMovies = genre.movies.length;
    const totalPages = Math.ceil(totalMovies / limit);

    const movies = await Movie.findAll({
      include: { model: Genre, as: "genres", where: { id: id }, through: { attributes: [] } },
      attributes: ['id', 'judul', 'cover_url'], // hanya ambil id, judul, cover_url
      limit: limit,
      offset: offset
    });

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalMovies,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  getAllGenres,
  getMoviesByGenre
};