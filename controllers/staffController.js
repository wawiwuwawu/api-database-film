const { Staff, Movie, MovieStaff } = require("../models");
const { sequelize } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');

const createStaff = async (req, res) => {
  try {
    const { nama } = req.body;

    if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
    }

    const existing = await Staff.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nama')),
        sequelize.fn('LOWER', nama)
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

      const seiyu = await Staff.create({
        ...req.body,
        ...imgurData
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
    const staff = await Staff.findAll({
      include: [
        { model: Movie, through: { model: MovieStaff, attributes: [] }, as: 'staff' },
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id, {
      include: [
        { model: Movie, through: { model: MovieStaff, attributes: [] }, as: 'staff' },
      ],
      order: [['createdAt', 'DESC']]
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
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff tidak ditemukan", });
    }

    if (req.body.nama && req.body.nama !== staff.nama) {
      const exists = await Staff.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('nama')),
          sequelize.fn('LOWER', req.body.nama)
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
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff tidak ditemukan" });
    }

    if (staff.delete_hash) {
      await deleteFromImgur(staff.delete_hash);
    }

    await Staff.destroy({ where: { id } });
    return res.status(200).json({ success: true, message: "Staff berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};