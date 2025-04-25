const { Movie, Genre, Staff, Theme, Seiyu, Karakter, MovieSeiyu } = require("../models");
const { sequelize } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');


const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};


const createMovie = async (req, res) => {
  try {

    const { judul, genreIds = [], themeIds = [] } = req.body;

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Format file harus JPG/PNG'
      });
    }

    const validateIds = (ids, nama) => {
      if (!Array.isArray(ids)) {
        throw new Error(`${nama} harus berupa array`);
      }
      if (ids.length === 0) {
        throw new Error(`${nama} tidak boleh kosong`);
      }
      const parsed = ids.map(item => {
        const num = Number.isInteger(item) ? item : parseInt(item, 10);
        if (Number.isNaN(num)) {
          throw new Error(`${nama} harus berisi angka`);
        }
        return num;
      });

      return parsed;
      
    };

    try {
      validateIds(genreIds, 'genreIds');
      validateIds(themeIds, 'themeIds');
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const existing = await Movie.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('judul')),
        sequelize.fn('LOWER', judul)
      ),
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: "Judul sudah ada di database" 
      });
    }

    let imgurData = {};
    const transaction = await sequelize.transaction();

    try {

      const [genre, theme] = await Promise.all([
        Genre.findAll({ where: { id: genreIds }, transaction }),
        Theme.findAll({ where: { id: themeIds }, transaction })
      ]);

      if (genre.length !== genreIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Genre tidak valid" });
      }
      
      if (theme.length !== themeIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Tema tidak valid" });
      }

      if (req.file) {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      }

      const movie = await Movie.create({
        ...req.body,
        cover_url: imgurData.image_url,
        delete_hash: imgurData.delete_hash
      }, { transaction });

      await Promise.all([
        movie.addGenre(genre, { transaction }),
        movie.addTheme(theme, { transaction }),
      ]);

      await transaction.commit();

      const responseData = {
        ...movie.get(),
        genres: genre.map(g => g.get()),
        themes: theme.map(t => t.get())
      }

      return res.status(201).json({ 
        success: true, 
        data: responseData 
      });
    } catch (error) {
      await transaction.rollback();
      if (imgurData.deleteHash) {
        await deleteFromImgur(imgurData.deleteHash);
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      include: [
        { model: Genre, attributes: ['id', 'nama'], as: 'genres' },
        { model: Staff, attributes: ['id', 'nama', 'role'], as: 'staff' },
        { model: Theme, attributes: ['id', 'nama'], as: 'themes' }
      ],
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, data: movies });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [
        { model: Genre, attributes: ['id', 'nama'], as: 'genres' },
        { model: Staff, attributes: ['id', 'nama', 'role'], as: 'staff' },
        { model: Theme, attributes: ['id', 'nama'], as: 'themes' }
      ]
    });
    if (!movie) return errorResponse(res, 404, "Film tidak ditemukan");
    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const updateMovie = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const movie = await Movie.findByPk(req.params.id, { transaction });
    if (!movie) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Film tidak ditemukan" });
    }

    if (req.body.judul && req.body.judul !== movie.judul) {
      const exists = await Movie.findOne({ 
        where: squenelize.where(
          sequelize.fn('LOWER', sequelize.col('judul')),
          sequelize.fn('LOWER', req.body.judul)
        ),
        transaction
      });

      if (exists) {
        await transaction.rollback();
        return res.status(409).json({ success: false, error: "Judul sudah ada di database" });
      }
    }

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
    }
    

    let imgurData = {};
    const transaction = await sequelize.transaction();

    if (req.file && movie.delete_hash) {
      try {
        if (movie.delete_hash) {
          await deleteFromImgur(movie.delete_hash);
        }

        imgurData = await uploadToImgur({ buffer: req.file.buffer });

      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    await movie.update({
      ...req.body,
      ...imgurData
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};


const deleteMovie = async (req, res) => {
  const { sequelize } = Movie;
  let transaction;

  try {
    const { id } = req.params;

    transaction = await sequelize.transaction();

    const movie = await Movie.findByPk(id, { transaction });

    if (!movie) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Film tidak ditemukan" });
    }

    if (movie.delete_hash) {
      try {
        await deleteFromImgur(movie.delete_hash);
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: `Gagal menghapus gambar: ${error.message}` });
      }
    }
    
    await movie.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ success: true, message: "Film berhasil dihapus" });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
};
