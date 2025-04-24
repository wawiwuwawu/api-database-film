const { Movie, Genre, Staff, Theme, Seiyu, Karakter, MovieSeiyu } = require("../models");
const { sequelize } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');
const { body, validationResult } = require('express-validator');


const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};


const createMovie = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {

    const existing = await Movie.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('judul')),
        sequelize.fn('LOWER', req.body.judul)
      ),
      transaction
    });
    if (existing) {
      await transaction.rollback();
      return errorResponse(res, 409, "Judul sudah ada di database");
    }

    
    if (req.file) {
      const { url, deleteHash } = await uploadToImgur(req.file);
      req.body.cover_url = url;
      req.body.delete_hash = deleteHash;
    }

    // 3. Simpan movie
    const movie = await Movie.create({ ...req.body }, { transaction });

    // 4. Set relasi
    const relations = {
      Genres: req.body.genres,
      Staff: req.body.staff,
      Themes: req.body.themes,
      Pengisi_suara: req.body.seiyus
    };
    for (const [alias, ids] of Object.entries(relations)) {
      if (ids && ids.length) {
        await movie[`set${alias}`](ids, { transaction });
      }
    }

    // 5. Reload dengan relasi
    const data = await Movie.findByPk(movie.id, {
      include: [
        { model: Genre, attributes: ['id', 'nama'], as: 'genres' },
        { model: Staff, attributes: ['id', 'nama', 'role'], as: 'staff' },
        { model: Theme, attributes: ['id', 'nama'], as: 'themes' },
        { model: Seiyu, attributes: ['id', 'nama'], through: { model: MovieSeiyu, attributes: [] }, as: 'pengisi_suara' },
        { model: Karakter, attributes: ['id', 'nama'], through: { model: MovieSeiyu, attributes: [] }, as: 'karakter' }
      ],
      transaction
    });

    await transaction.commit();
    return res.status(201).json({ success: true, data });
  } catch (error) {
    await transaction.rollback();
    return errorResponse(res, 500, error.message);
  }
};

// Get all Movies
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

// Get Movie by ID
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
    return errorResponse(res, 500, error.message);
  }
};

// Update Movie
const updateMovie = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const movie = await Movie.findByPk(req.params.id, { transaction });
    if (!movie) {
      await transaction.rollback();
      return errorResponse(res, 404, "Film tidak ditemukan");
    }

    // Cek duplikasi judul
    if (req.body.judul && req.body.judul !== movie.judul) {
      const exists = await Movie.findOne({ where: { judul: req.body.judul }, transaction });
      if (exists) {
        await transaction.rollback();
        return errorResponse(res, 409, "Judul sudah digunakan");
      }
    }

    // Update gambar
    if (req.file) {
      if (movie.delete_hash) await deleteFromImgur(movie.delete_hash);
      const { url, deleteHash } = await uploadToImgur(req.file);
      req.body.cover_url = url;
      req.body.delete_hash = deleteHash;
    }

    await movie.update(req.body, { transaction });

    // Update relasi
    const relations = {
      Genres: req.body.genres,
      Staff: req.body.staff,
      Themes: req.body.themes,
      Pengisi_suara: req.body.seiyus
    };
    for (const [alias, ids] of Object.entries(relations)) {
      if (ids !== undefined) {
        await movie[`set${alias}`](ids || [], { transaction });
      }
    }

    const updated = await Movie.findByPk(movie.id, {
      include: [
        { model: Genre, attributes: ['id', 'nama'], as: 'genres' },
        { model: Staff, attributes: ['id', 'nama', 'role'], as: 'staff' },
        { model: Theme, attributes: ['id', 'nama'], as: 'themes' }
      ],
      transaction
    });

    await transaction.commit();
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    await transaction.rollback();
    return errorResponse(res, 500, error.message);
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const movie = await Movie.findByPk(req.params.id, { transaction });
    if (!movie) {
      await transaction.rollback();
      return errorResponse(res, 404, "Film tidak ditemukan");
    }

    if (movie.delete_hash) await deleteFromImgur(movie.delete_hash);
    await movie.destroy({ transaction });
    await transaction.commit();
    return res.status(200).json({ success: true, message: "Film berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
};
