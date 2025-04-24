const { Karakter, Movie, Seiyu, MovieSeiyu } = require("../models");
const { sequelize } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');

const createKarakter = async (req, res) => {
  try {
    const { name } = req.body;

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Format file harus JPG/PNG' 
      });
    }

    const existing = await Karakter.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', name)
      )
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: "Nama karakter sudah terdaftar" 
      });
    }

    let imgurData = {};
    const transaction = await sequelize.transaction();

    try {
      if (req.file) {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      }

      const karakter = await Karakter.create({
        ...req.body,
        ...imgurData
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({ 
        success: true, 
        data: karakter 
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
}

const getAllKarakter = async (req, res) => {
  try {
    const karakters = await Karakter.findAll();
    if (karakters.length === 0) {
      return res
        .status(200)
        .json({ success: true, data: [], message: "Belum ada karakter tersimpan" });
    }
    return res.status(200).json({ success: true, data: karakters });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const getKarakterDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const karakter = await Karakter.findByPk(id, {
      include: [
        { model: Movie, through: { model: MovieSeiyu, attributes: [] }, as: "movies" },
        { model: Seiyu, through: { model: MovieSeiyu, attributes: [] }, as: "seiyus" }
      ]
    });

    if (!karakter) {
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: karakter
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createKarakter, getAllKarakter, getKarakterDetail };
