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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: movies } = await Movie.findAndCountAll({
      attributes: ['id', 'judul', 'tahun_rilis', 'type', 'rating', 'cover_url'],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllMoviesDetail = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: movies } = await Movie.findAndCountAll({
      include: [
        { model: Genre, attributes: ['id', 'nama'], as : 'genres', through: { attributes: [] } },
        { model: Theme, attributes: ['id', 'nama'], as : 'themes', through: { attributes: [] } },
        { model: Staff, attributes: ['id', 'name', 'role', 'profile_url'], as : 'staffs', through: { attributes: [] } },
        { model: Seiyu, attributes: ['id', 'name', 'profile_url'], through: { attributes: ['karakter_id'] }, as: 'seiyus', include: [{ model: Karakter, as: 'karakters', attributes: ['id', 'nama'], through: { attributes: [] } }] },
        { model: Karakter, attributes: ['id', 'nama', 'profile_url'], as : 'karakters', through: { attributes: [] } }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      return errorResponse(res, 404, "Film tidak ditemukan");
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

const getMovieByName = async (req, res) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    if (!name) {
      return res.status(400).json({ success: false, error: "Nama film harus disertakan dalam query parameter" });
    }

    const { count, rows: movies } = await Movie.findAndCountAll({
      attributes: ['id', 'judul', 'tahun_rilis', 'type', 'rating', 'cover_url'],
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('judul')),
        'LIKE',
        `%${name.toLowerCase()}%`
      ),
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    if (movies.length === 0) {
      return res.status(404).json({ success: false, error: "Film tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMovieByYear = async (req, res) => {
  try {
    const { year } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    if (!year) {
      return res.status(400).json({ success: false, error: "Tahun harus disertakan dalam query parameter" });
    }

    // Validasi tahun (harus berupa 4 digit angka)
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 10) {
      return res.status(400).json({ success: false, error: "Tahun tidak valid" });
    }

    const { count, rows: movies } = await Movie.findAndCountAll({
      attributes: ['id', 'judul', 'cover_url'],
      where: {
        tahun_rilis: yearNum
      },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    if (movies.length === 0) {
      return res.status(404).json({ success: false, error: `Tidak ada film yang dirilis pada tahun ${year}` });
    }

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateMovie = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const movieId = req.params.id;
    const { judul, genreIds = [], themeIds = [], staffIds = [], seiyuIds = [], karakterIds = [] } = req.body;

    const movie = await Movie.findByPk(movieId, { transaction });
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
        await transaction.rollback();
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
    }, { transaction });

    if (genreIds.length) {
      await movie.setGenres(genreIds, { transaction });
    }
    if (themeIds.length) {
      await movie.setThemes(themeIds, { transaction });
    }
    if (staffIds.length) {
      await movie.setStaffs(staffIds, { transaction });
    }

    if (seiyuIds.length) {

      await MovieSeiyu.destroy({
        where: { movie_id: movieId },
        transaction
      });

      const pivotEntries = seiyuIds.map((sid, i) => ({
        movie_id: movieId,
        seiyu_id: sid,
        karakter_id: karakterIds[i]
      }));
      await MovieSeiyu.bulkCreate(pivotEntries, { transaction });
  }

  await transaction.commit();

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
  await transaction.rollback();
  return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMovie = async (req, res) => {
  const { sequelize } = Movie;
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id, { transaction });

    if (!movie) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Film tidak ditemukan" });
    }

    if (movie.delete_hash) {
      try {
        await deleteFromImgur(movie.delete_hash);
      } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: `Gagal menghapus gambar: ${err.message}` });
      }
    }

    await Promise.all([
      MovieGenre.destroy({ where: { movie_id: id }, transaction }),
      MovieTheme.destroy({ where: { movie_id: id }, transaction }),
      MovieStaff.destroy({ where: { movie_id: id }, transaction }),
      MovieSeiyu.destroy({ where: { movie_id: id }, transaction })
    ]);
    
    await movie.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ success: true, message: "Film berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMovieByType = async (req, res) => {
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    if (!type) {
      return res.status(400).json({ success: false, error: "Tipe film harus disertakan dalam query parameter" });
    }

    // Validasi tipe yang diizinkan (sesuaikan dengan enum di model Movie)
    const allowedTypes = ['Movie', 'TV', 'OVA', 'ONA'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Tipe tidak valid. Tipe yang diizinkan: ${allowedTypes.join(', ')}` 
      });
    }

    const { count, rows: movies } = await Movie.findAndCountAll({
      attributes: ['id', 'judul', 'cover_url'],
      where: {
        type: type
      },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    if (movies.length === 0) {
      return res.status(404).json({ success: false, error: `Tidak ada film dengan tipe ${type}` });
    }

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMovieByRating = async (req, res) => {
  try {
    const { rating } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    if (!rating) {
      return res.status(400).json({ success: false, error: "Rating harus disertakan dalam query parameter" });
    }

    const allowedRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
    if (!allowedRatings.includes(rating.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        error: `Rating tidak valid. Rating yang diizinkan: ${allowedRatings.join(', ')}` 
      });
    }

    const { count, rows: movies } = await Movie.findAndCountAll({
      attributes: ['id', 'judul', 'cover_url'],
      where: sequelize.where(
        sequelize.fn('UPPER', sequelize.col('rating')),
        sequelize.fn('UPPER', rating)
      ),
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    if (movies.length === 0) {
      return res.status(404).json({ success: false, error: `Tidak ada film dengan rating ${rating.toUpperCase()}` });
    }

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
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
  getMovieByName,
  getMovieByYear,
  deleteMovie,
  getMovieByType,
  getMovieByRating
};
