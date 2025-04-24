const { Staff } = require("../models");
const { uploadToImgur, deleteFromImgur } = require('../config/imgur');

const createStaff = async (req, res) => {
  try {
    // Cek duplikasi nama
    const existingStaff = await Staff.findOne({ where: { nama: req.body.nama } });
    if (existingStaff) {
      return res.status(409).json({ 
        success: false,
        error: "Nama staff sudah terdaftar",
      });
    }

    let coverData = {};
    if (req.file) {
      const imgurResponse = await uploadToImgur(req.file);
      coverData = {
        cover_url: imgurResponse.url,
        delete_hash: imgurResponse.deleteHash,
      };
    }

    const staff = await Staff.create(
      {
        ...req.body,
        ...coverData,
      },
      { transaction }
    );
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.findAll();
    res.json({ success: true, data: staffList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: "Staff tidak ditemukan",
      });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: "Staff tidak ditemukan",
      });
    }

    // Cek duplikasi nama jika diubah
    if (req.body.nama && req.body.nama !== staff.nama) {
      const existingStaff = await Staff.findOne({ where: { nama: req.body.nama } });
      if (existingStaff) {
        return res.status(409).json({ 
          success: false,
          error: "Nama staff sudah terdaftar",
        });
      }
    }

    if (req.file) {
      const imgurResponse = await uploadToImgur(req.file);
      req.body.cover_url = imgurResponse.url;
      req.body.delete_hash = imgurResponse.deleteHash;
    }

    await staff.update(req.body);
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: "Staff tidak ditemukan",
      });
    }

    if (movie.delete_hash) {
      await deleteFromImgur(movie.delete_hash);
    }

    await staff.destroy();
    res.json({ success: true, message: "Staff berhasil dihapus" });
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