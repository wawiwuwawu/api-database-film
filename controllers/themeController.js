const { Theme } = require("../models");
const { Movie } = require("../models");

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const theme = await Theme.findByPk(id, {
      include: {
        model: Movie,
        as: 'movies',
        through: { attributes: [] }
      }
    });

    if (!theme) {
      return res.status(404).json({ success: false, message: "Theme tidak ditemukan" });
    }

    if (theme.movies.length === 0) {
      return res.status(404).json({ success: false, message: "Belum ada film di tema ini" });
    }

    const totalMovies = theme.movies.length;
    const totalPages = Math.ceil(totalMovies / limit);


    const movies = await Movie.findAll({
      include: {
        model: Theme,
        as: "theme",
        where: { id: id },
        through: { attributes: [] }
      },
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
  getAllThemes,
  getMoviesByTheme
  };