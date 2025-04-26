const { Movie, Seiyu, Karakter, MovieSeiyu } = require("../models");
const { sequelize } = require("../models");
const { validationResult } = require('express-validator');
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');


const createSeiyu = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { name } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
    }

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({  success: false,  error: 'Format file harus JPG/PNG' });
    }
    

    const existing = await Seiyu.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', name)
      )
    });

    if (existing) {
      return res.status(409).json({ success: false, error: "Nama seiyu sudah terdaftar" });
    }

    let imgurData = {};
    const transaction = await sequelize.transaction();
    
    try {
      if (req.file) {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      }

      const seiyu = await Seiyu.create({
        ...req.body,
        profile_url: imgurData.image_url,
        delete_hash: imgurData.delete_hash
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({ success: true, data: seiyu });

  } catch (error) {
    await transaction.rollback();
    if (imgurData.deleteHash) {
      await deleteFromImgur(imgurData.deleteHash);
    }

    throw error;
    }

  } catch (error) {
    return res.status(500).json({  success: false, error: error.message });
  }
};

const getAllSeiyus = async (req, res) => {
  try {
    const seiyus = await Seiyu.findAll();

    if (seiyus.length === 0) {
      return res.json({ success: true, data: [], message: "Belum ada seiyu tersimpan" });
    }
    return res.status(200).json({ success: true, data: seiyus });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
}
};

const getSeiyuById = async (req, res) => {
  try {
    const { id } = req.params;
    const seiyu = await Seiyu.findByPk(id);
    if (!seiyu) {
      return res.status(404).json({ success: false, message: "Seiyu tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllSeiyusDetail = async (req, res) => {
  try {
    const seiyu = await Seiyu.findAll({
      include: [
        { model: Karakter, through: { model: MovieSeiyu, attributes: [] }, as: "karakters" },
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ]
    });


    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getSeiyusDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const seiyu = await Seiyu.findByPk(id, {
      include: [
        { model: Karakter, through: { model: MovieSeiyu, attributes: [] }, as: "karakters" },
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ]
    });
    if (!seiyu) {
      return res.status(404).json({ success: false, message: "Seiyu tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getAllSeiyusKarakter = async (req, res) => {
  try {
    const seiyu = await Seiyu.findAll({
      include: [
        { model: Karakter, through: { model: MovieSeiyu, attributes: [] }, as: "karakters" }
      ]
    });
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getSeiyusKarakterById = async (req, res) => {
  try {
    const { id } = req.params;
    const seiyu = await Seiyu.findByPk(id, {
      include: [
        { model: Karakter, through: { model: MovieSeiyu, attributes: [] }, as: "karakters" }
      ]
    });
    if (!seiyu) {
      return res.status(404).json({ success: false, message: "Seiyu tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getAllSeiyusMovie = async (req, res) => {
  try {
    const seiyu = await Seiyu.findAll({
      include: [
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ]
    });
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getSeiyusMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const seiyu = await Seiyu.findByPk(id, {
      include: [
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" }
      ]
    });
    if (!seiyu) {
      return res.status(404).json({ success: false, message: "Seiyu tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}




const updateSeiyu = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
  }
  
  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
  }


  const transaction = await sequelize.transaction();
  try {
    const seiyu = await Seiyu.findByPk(req.params.id, { transaction });
    
    if (!seiyu) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Seiyu tidak ditemukan" });
    }

    if (req.body.name && req.body.name !== seiyu.name) {
      const exists = await Seiyu.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.fn('LOWER', req.body.name)
        ),
        transaction
      });
      
      if (exists) {
        await transaction.rollback();
        return res.status(409).json({  success: false,  error: "Nama seiyu sudah terdaftar"  });
      }
    }

    let imgurData = {};
    if (req.file) {
      if (seiyu.delete_hash) {
        try {
          await deleteFromImgur(seiyu.delete_hash);
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



    await seiyu.update(updateData, { transaction });
    await transaction.commit();
    
    const updatedSeiyu = await Seiyu.findByPk(req.params.id);
    
    return res.status(200).json({ success: true, data: updatedSeiyu });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};


const deleteSeiyu = async (req, res) => {
  const { sequelize } = Seiyu;
  let transaction;
  
  try {
      const { id } = req.params;

      transaction = await sequelize.transaction();

      const seiyu = await Seiyu.findByPk(id, { transaction });

      if (!seiyu) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: "Seiyu tidak ditemukan" });
      }

      if (seiyu.delete_hash) {
        try {
        await deleteFromImgur(seiyu.delete_hash);
      } catch (imgurError) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: "Gagal menghapus gambar", details: imgurError.message });
      }
    }

      await seiyu.destroy({ transaction });

      await transaction.commit();

      return res.status(200).json({ success: true, message: "Seiyu berhasil dihapus" });
  } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createSeiyu,
  getAllSeiyus,
  getAllSeiyusDetail,
  getSeiyusDetailById,
  getAllSeiyusKarakter,
  getSeiyusKarakterById,
  getAllSeiyusMovie,
  getSeiyusMovieById,
  getSeiyuById,
  updateSeiyu,
  deleteSeiyu
};
