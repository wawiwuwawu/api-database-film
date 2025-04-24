// controllers/seiyuController.js
const { Movie, Seiyu, Karakter, MovieSeiyu } = require("../models");
const { sequelize } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');


// Create Seiyu
const createSeiyu = async (req, res) => {
  try {
    const { name } = req.body;

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Format file harus JPG/PNG' 
      });
    }

    const existing = await Seiyu.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', name)
      )
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: "Nama seiyu sudah terdaftar" 
      });
    }

    let imgurData = {};
    const transaction = await sequelize.transaction();
    
    try {
      if (req.file) {
        imgurData = await uploadToImgur(req.file);
      }

      const seiyu = await Seiyu.create({
        ...req.body,
        ...imgurData
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({ 
        success: true, 
        data: seiyu 
      });

  } catch (error) {
    await transaction.rollback();
    if (imgurData.deleteHash) {
      await deleteFromImgur(imgurData.deleteHash);
    }

    throw error;
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get all Seiyus
const getAllSeiyus = async (req, res) => {
  try {
    const seiyus = await Seiyu.findAll();
    return res.status(200).json({ success: true, data: seiyus });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get Seiyu by ID with characters and movies
const getSeiyuById = async (req, res) => {
  try {
    const { id } = req.params;
    const seiyu = await Seiyu.findByPk(id, {
      include: [
        {
          model: Karakter,
          through: { model: MovieSeiyu, attributes: [] },
          as: "karakter"
        },
        {
          model: Movie,
          through: { model: MovieSeiyu, attributes: [] },
          as: "pengisi_suara"
        }
      ]
    });
    if (!seiyu) {
      return res.status(404).json({ success: false, message: "Seiyu tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: seiyu });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update Seiyu
const updateSeiyu = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const seiyu = await Seiyu.findByPk(req.params.id, { transaction });
    
    if (!seiyu) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        error: "Seiyu tidak ditemukan" 
      });
    }

    // Validasi nama
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
        return res.status(409).json({ 
          success: false, 
          error: "Nama seiyu sudah terdaftar" 
        });
      }
    }

    // Handle gambar
    let newImgurData = {};
    if (req.file) {
      try {
        // Delete old image
        if (seiyu.delete_hash) {
          await deleteFromImgur(seiyu.delete_hash);
        }
        
        // Upload new
        newImgurData = await uploadToImgur(req.file);
      
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ 
          success: false, 
          error: `Gagal update gambar: ${error.message}` 
        });
      }
    }

    // Update data
    await seiyu.update({
      ...req.body,
      ...newImgurData
    }, { transaction });

    await transaction.commit();
    
    return res.status(200).json({ 
      success: true, 
      data: seiyu 
    });

  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete Seiyu
const deleteSeiyu = async (req, res) => {
  try {
    const { id } = req.params;
    const seiyu = await Seiyu.findByPk(id);
    if (!seiyu) {
      return res.status(404).json({ success: false, message: "Seiyu tidak ditemukan" });
    }

    if (seiyu.delete_hash) {
      await deleteFromImgur(seiyu.delete_hash);
    }

    await seiyu.destroy();
    return res.status(200).json({ success: true, message: "Seiyu berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createSeiyu,
  getAllSeiyus,
  getSeiyuById,
  updateSeiyu,
  deleteSeiyu
};
