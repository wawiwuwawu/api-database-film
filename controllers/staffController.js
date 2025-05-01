const { Staff, Movie, MovieStaff } = require("../models");
const { sequelize } = require("../models");
const { validationResult } = require('express-validator');
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');




const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { name } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
    }

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
    }

    const existing = await Staff.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', name)
      )
    });

    if (existing) {
      return res.status(409).json({ success: false, error: "Nama staff sudah terdaftar" });
    }

    let imgurData = {};
    const transaction = await sequelize.transaction();

    try {
      if (req.file) {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      }

      const staff = await Staff.create({
        ...req.body,
        profile_url: imgurData.image_url,
        delete_hash: imgurData.delete_hash
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({ success: true, data: staff });

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
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll();
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllStaffMovie = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      include: [
        { model: Movie, through: { model: MovieStaff, attributes: [] }, as: 'movies' },
      ]
    });
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getStaffMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id, {
      include: [
        { model: Movie, through: { model: MovieStaff, attributes: [] }, as: 'movies' },
      ],
    });
    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateStaff = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff tidak ditemukan", });
    }

    if (req.body.name && req.body.name !== staff.name) {
      const exists = await Staff.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.fn('LOWER', req.body.name)
        ),
        transaction
      });

      if (exists) {
        return res.status(409).json({ success: false, error: "Nama staff sudah terdaftar", });
      }
    }

    let imgurData = {};
    if (staff.delete_hash) {
      await deleteFromImgur(staff.delete_hash);
    }

    try {
      if (req.file) {
        if (['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
          imgurData = await uploadToImgur({ buffer: req.file.buffer });
        } else {
          return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
        }
      }

      const staff = await Staff.update({
        ...req.body,
        ...imgurData
      }, {
        where: { id: req.params.id }
      })

      await transaction.commit();

      return res.status(200).json({ success: true, data: staff });

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
};


const deleteStaff = async (req, res) => {
  const { sequelize } = Staff;
  let transaction;

  try {
      const { id } = req.params;

      transaction = await sequelize.transaction();

      const staff = await Staff.findByPk(id, { transaction });

      if (!staff) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: "Staff tidak ditemukan" });
      }

      if (staff.delete_hash) {
        try {
          await deleteFromImgur(staff.delete_hash);
        } catch (imgurError) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: "Gagal menghapus gambar" });
      }
    }

      await staff.destroy({ transaction });

      await transaction.commit();

      return res.status(200).json({ success: true, message: "Staff berhasil dihapus" });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  };


module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  getAllStaffMovie,
  getStaffMovieById,
  deleteStaff
};