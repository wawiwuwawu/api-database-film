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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: staff } = await Staff.findAndCountAll({
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: staff,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: staff } = await Staff.findAndCountAll({
      include: [
        { model: Movie, through: { model: MovieStaff, attributes: [] }, as: 'movies' },
      ],
      limit,
      offset,
    });
    return res.status(200).json({
      success: true,
      data: staff,
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

const getStaffByName = async (req, res) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    if (!name) {
      return res.status(400).json({ success: false, error: "Nama staff harus disertakan dalam query parameter" });
    }

    const { count, rows: staff } = await Staff.findAndCountAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        'LIKE',
        `%${name.toLowerCase()}%`
      ),
      limit,
      offset,
    });

    if (staff.length === 0) {
      return res.status(404).json({ success: false, error: "Staff tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: staff,
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

const updateStaff = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
  }
  
  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
  }

  const transaction = await sequelize.transaction();
  try {
    const staff = await Staff.findByPk(req.params.id, { transaction });

    if (!staff) {
      await transaction.rollback();
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
        await transaction.rollback();
        return res.status(409).json({ success: false, error: "Nama staff sudah terdaftar", });
      }
    }

    let imgurData = {};
    if (req.file) {
      if (staff.delete_hash) {
        try {
          await deleteFromImgur(staff.delete_hash);
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

    await staff.update(updateData, { transaction });
    await transaction.commit();

    const updatedStaff = await Staff.findByPk(req.params.id);

    return res.status(200).json({ success: true, data: updatedStaff });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ success: false, error: error.message });
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
  getStaffByName,
  deleteStaff
};