const { Movie, Genre, Staff, Theme, Seiyu, Karakter, MovieSeiyu, MovieGenre, MovieStaff, MovieTheme } = require("../models");
const { sequelize } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');


const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};


const createMovie = async (req, res) => {
  try {

    const { judul, genreIds = [], themeIds = [], staffIds = [], seiyuIds = [], karakterIds = [] } = req.body;

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
      validateIds(staffIds, 'staffIds');
      validateIds(seiyuIds, 'seiyuIds');
      validateIds(karakterIds, 'karakterIds');

      if (seiyuIds.length !== karakterIds.length) {
        throw new Error('Jumlah seiyuIds dan karakterIds harus sama (pasangan satu-satu)');
      }

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

      const [genre, theme, staff, seiyu, karakter] = await Promise.all([
        Genre.findAll({ where: { id: genreIds }, transaction }),
        Theme.findAll({ where: { id: themeIds }, transaction }),
        Staff.findAll({ where: { id: staffIds }, transaction }),
        Seiyu.findAll({ where: { id: seiyuIds }, transaction }),
        Karakter.findAll({ where: { id: karakterIds }, transaction })
      ]);

      if (genre.length !== genreIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Genre tidak valid" });
      }
      
      if (theme.length !== themeIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Tema tidak valid" });
      }

      if (staffIds.length > 0 && staff.length !== staffIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Staff tidak valid" });
      }

      if (seiyu.length !== seiyuIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Seiyu tidak valid" });
      }

      if (karakter.length !== karakterIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "Karakter tidak valid" });
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
        movie.addStaff(staff, { transaction })
      ]);

      const pivotEntries = seiyuIds.map((sid, i) => ({
        movie_id: movie.id,
        seiyu_id: sid,
        karakter_id: karakterIds[i]
      }));

      await MovieSeiyu.bulkCreate(pivotEntries, { transaction });

      await transaction.commit();


      const created = await Movie.findByPk(movie.id, {
        include: [
          { model: Genre, as: 'genres' },
          { model: Theme, as: 'themes' },
          { model: Staff, as: 'staffs' },
          {
            model: Seiyu,
            as: 'seiyus',
            through: { attributes: ['karakter_id'] },
            include: [{ model: Karakter, as: 'karakters' }]
          }
        ]
      });

      return res.status(201).json({ 
        success: true, 
        data: created 
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
    const movie = await Movie.findAll();

    if (movie.length === 0) {
      return res.status(200).json({ success: true, data: [], message: "Belum ada film tersimpan" });
    }
    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllMoviesDetail = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      include: [
        { model: Genre, attributes: ['id', 'nama'], as : 'genres', through: { attributes: [] } },
        { model: Theme, attributes: ['id', 'nama'], as : 'themes', through: { attributes: [] } },
        { model: Staff, attributes: ['id', 'name', 'role', 'profile_url'], as : 'staffs', through: { attributes: [] } },
        { model: Seiyu, attributes: ['id', 'name', 'profile_url'], through: { attributes: ['karakter_id'] }, as: 'seiyus', include: [{ model: Karakter, as: 'karakters', attributes: ['id', 'nama'], through: { attributes: [] } }] },
        { model: Karakter, attributes: ['id', 'nama', 'profile_url'], as : 'karakters', through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, data: movies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ success: false, error: "Film tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getMovieByIdDetail = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [
        { model: Genre, attributes: ['id', 'nama'], as : 'genres', through: { attributes: [] } },
        { model: Theme, attributes: ['id', 'nama'], as : 'themes', through: { attributes: [] } },
        { model: Staff, attributes: ['id', 'name', 'role', 'profile_url'], as : 'staffs', through: { attributes: [] } },
        { model: Seiyu, attributes: ['id', 'name', 'profile_url'], through: { attributes: ['karakter_id'] }, as: 'seiyus', include: [{ model: Karakter, as: 'karakters', attributes: ['id', 'nama'], through: { attributes: [] } }] },
        { model: Karakter, attributes: ['id', 'nama', 'profile_url'], as : 'karakters', through: { attributes: [] } }
      ]
    });
    if (!movie) return errorResponse(res, 404, "Film tidak ditemukan");
    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const updateMovie = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const movieId = req.params.id;
    const { judul, genreIds = [], themeIds = [], staffIds = [], seiyuIds = [], karakterIds = [] } = req.body;

    const movie = await Movie.findByPk(movieId, { transaction: t });
    if (!movie) {
      return res.status(404).json({ success: false, error: "Film tidak ditemukan" });
    }

    if (judul && judul.toLowerCase() !== movie.judul.toLowerCase()) {
      const existing = await Movie.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('judul')),
          sequelize.fn('LOWER', judul)
        ),
      });

      if (existing) {
        return res.status(409).json({ success: false, error: "Judul sudah ada di database" });
      }
    }

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
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
    }

    try {
      validateIds(genreIds, 'genreIds');
      validateIds(themeIds, 'themeIds');
      validateIds(staffIds, 'staffIds');
      validateIds(seiyuIds, 'seiyuIds');
      validateIds(karakterIds, 'karakterIds');

      if (seiyuIds.length !== karakterIds.length) {
        throw new Error('Jumlah seiyuIds dan karakterIds harus sama (pasangan satu-satu)');
      }

    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    let imgurData = {};
    if (req.file) {
      if (movie.delete_hash) {
        try {
          await deleteFromImgur(movie.delete_hash);
        } catch (err) {
          console.warn('Gagal hapus gambar lama di Imgur:', err);
        }
      }

      try {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      } catch (err) {
        await t.rollback();
        return res.status(500).json({
          success: false,
          error: `Gagal upload gambar baru: ${err.message}`
        });
      }
    }

    await movie.update({
      ...req.body,
      cover_url: imgurData.image_url,
      delete_hash: imgurData.delete_hash
    }, { transaction: t });

    if (genreIds.length) {
      await movie.setGenres(genreIds, { transaction: t });
    }
    if (themeIds.length) {
      await movie.setThemes(themeIds, { transaction: t });
    }
    if (staffIds.length) {
      await movie.setStaffs(staffIds, { transaction: t });
    }

    if (seiyuIds.length) {

      await MovieSeiyu.destroy({
        where: { movie_id: movieId },
        transaction: t
      });

      const pivotEntries = seiyuIds.map((sid, i) => ({
        movie_id: movieId,
        seiyu_id: sid,
        karakter_id: karakterIds[i]
      }));
      await MovieSeiyu.bulkCreate(pivotEntries, { transaction: t });
  }

  await t.commit();

  const updatedMovie = await Movie.findByPk(movieId, {
    include: [
      { model: Genre, as: 'genres', through: { attributes: [] } },
      { model: Theme, as: 'themes', through: { attributes: [] } },
      { model: Staff, as: 'staffs', through: { attributes: [] } },
      {
        model: Seiyu,
        as: 'seiyus',
        through: { attributes: ['karakter_id'] },
        include: [{ model: Karakter, as: 'karakters', through: { attributes: [] } }]
      },
      { model: Karakter, as: 'karakters', through: { model: MovieSeiyu, attributes: ['seiyu_id'] } }
    ]
  });

  return res.status(200).json({ success: true, data: updatedMovie });
} catch (error) {
  await t.rollback();
  return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMovie = async (req, res) => {
  const { sequelize } = Movie;
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id, { transaction: t });

    if (!movie) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Film tidak ditemukan" });
    }

    if (movie.delete_hash) {
      try {
        await deleteFromImgur(movie.delete_hash);
      } catch (err) {
        await t.rollback();
        return res.status(500).json({ success: false, error: `Gagal menghapus gambar: ${err.message}` });
      }
    }

    await Promise.all([
      MovieGenre.destroy({ where: { movie_id: id }, transaction: t }),
      MovieTheme.destroy({ where: { movie_id: id }, transaction: t }),
      MovieStaff.destroy({ where: { movie_id: id }, transaction: t }),
      MovieSeiyu.destroy({ where: { movie_id: id }, transaction: t })
    ]);
    
    await movie.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({ success: true, message: "Film berhasil dihapus" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  getAllMoviesDetail,
  getMovieByIdDetail,
  deleteMovie
};
