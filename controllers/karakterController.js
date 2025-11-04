const { Karakter, Movie, Seiyu, MovieSeiyu } = require("../models");
const { sequelize } = require("../models");
const { validationResult } = require('express-validator');
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');



const createKarakter = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { nama } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
    }

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
    }

    const existing = await Karakter.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nama')),
        sequelize.fn('LOWER', nama)
      )
    });

    if (existing) {
      return res.status(409).json({ success: false, error: "Nama karakter sudah terdaftar" });
    }

    let imgurData = {};
    const transaction = await sequelize.transaction();

    try {
      if (req.file) {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      }

      const karakter = await Karakter.create({
        ...req.body,
        profile_url: imgurData.image_url,
        delete_hash: imgurData.delete_hash
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({ success: true, data: karakter });

    } catch (error) {
      await transaction.rollback();
      if (imgurData.deleteHash) {
        await deleteFromImgur(imgurData.deleteHash);
      }
      throw error;
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

//tes coba

const getAllKarakter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: karakter } = await Karakter.findAndCountAll({
      limit,
      offset
    });

    if (karakter.length === 0) {
      return res.json({ success: true, data: [], message: "Belum ada karakter tersimpan" });
    }

    return res.status(200).json({
      success: true,
      data: karakter,
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

const getKarakterById = async (req, res) => {
  try {
    const { id } = req.params;
    const karakter = await Karakter.findByPk(id);
    if (!karakter) {
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: karakter });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const getKarakterDetail = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: karakter } = await Karakter.findAndCountAll({
      include: [
        { model: Seiyu, through: { model: MovieSeiyu, attributes: [] }, as: "seiyus" },
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ],
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      data: karakter,
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

const getKarakterDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const karakter = await Karakter.findByPk(id, {
      include: [
        { model: Seiyu, through: { model: MovieSeiyu, attributes: [] }, as: "seiyus" },
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ]
    });

    if (!karakter) {
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: karakter });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getKarakterSeiyu = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: karakter } = await Karakter.findAndCountAll({
      include: [
        { model: Seiyu, through: { model: MovieSeiyu, attributes: [] }, as: "seiyus" }
      ],
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      data: karakter,
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
}

const getKarakterSeiyuById = async (req, res) => {
  try {
    const { id } = req.params;
    const karakter = await Karakter.findByPk(id, {
      include: [
        { model: Seiyu, through: { model: MovieSeiyu, attributes: [] }, as: "seiyus" }
      ]
    });

    if (!karakter) {
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: karakter });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getKarakterMovie = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: karakter } = await Karakter.findAndCountAll({
      include: [
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ],
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      data: karakter,
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
}

const getKarakterMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const karakter = await Karakter.findByPk(id, {
      include: [
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ]
    });

    if (!karakter) {
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: karakter });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getKarakterByName = async (req, res) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    if (!name) {
      return res.status(400).json({ success: false, error: "Nama karakter harus disertakan dalam query parameter" });
    }

    const { count, rows: karakter } = await Karakter.findAndCountAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nama')),
        'LIKE',
        `%${name.toLowerCase()}%`
      ),
      limit,
      offset
    });

    if (karakter.length === 0) {
      return res.status(404).json({ success: false, error: "Karakter tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: karakter,
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

const updateKarakter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
  }
  
  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
  }


  const transaction = await sequelize.transaction();
  try {
    const karakter = await Karakter.findByPk(req.params.id, { transaction });
    
    if (!karakter) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Karakter tidak ditemukan" });
    }

    if (req.body.nama && req.body.nama !== karakter.nama) {
      const exists = await Karakter.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('nama')),
          sequelize.fn('LOWER', req.body.nama)
        ),
        transaction
      });
      
      if (exists) {
        await transaction.rollback();
        return res.status(409).json({  success: false,  error: "Nama karakter sudah terdaftar"  });
      }
    }

    let imgurData = {};
    if (req.file) {
      if (karakter.delete_hash) {
        try {
          await deleteFromImgur(karakter.delete_hash);
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

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.profile_url = imgurData.image_url;
      updateData.delete_hash = imgurData.delete_hash;
    } else {
      delete updateData.profile_url;
      delete updateData.delete_hash;
    }



    await karakter.update(updateData, { transaction });
    await transaction.commit();
    
    const updatedKarakter = await Karakter.findByPk(req.params.id);
    
    return res.status(200).json({ success: true, data: updatedKarakter });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
}

const deleteKarater = async (req, res) => {
  const { sequelize } = Karakter;
  let transaction;

  try {
    const { id } = req.params;

    transaction = await sequelize.transaction();

    const karakter = await Karakter.findByPk(id, { transaction });

    if (!karakter) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }

    if (karakter.delete_hash) {
      try {
        await deleteFromImgur(karakter.delete_hash);
      } catch (imgurError) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: `Gagal menghapus gambar: ${imgurError.message}` });
      }
    }

    await karakter.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ success: true, message: "Karakter berhasil dihapus" });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  createKarakter, 
  getAllKarakter, 
  getKarakterById,
  getKarakterDetail,
  getKarakterDetailById,
  getKarakterSeiyu,
  getKarakterSeiyuById,
  getKarakterMovie,
  getKarakterMovieById,
  getKarakterByName,
  updateKarakter,
  deleteKarater
};
