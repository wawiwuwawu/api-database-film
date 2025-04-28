const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, sequelize } = require('../models');
const { deleteFromImgur, uploadToImgur } = require('../config/imgur');

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validasi gagal", errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
      { expiresIn: '1h' }
    );

    return res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });

  } catch (error) {
    console.error('Registrasi error:', error.message);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};


const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validasi gagal", errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
    }


    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
      { expiresIn: '1h' }
    );

    return res.status(200).json({ success: true, message: 'Login berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_url: user.profile_url
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};


const getAllUser = async (req, res) => {
  try {
    const users = await User.findAll();

    if (users.length === 0) {
      return res.json({ success: true, data:[], message: "Belum ada user tersimpan"});
    }
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id','name','email','role','profile_url']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan"});
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCurrentUser(req, res) {

  const userId = req.user.userId;

  const user = await User.findByPk(userId, {
    attributes: ['id','name','email','role','profile_url']
  });

  return res.json({ success: true, data: user });
}

const updateUser = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
  }

  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
  }

  const transaction = await sequelize.transaction();
  try {
    const users = await User.findByPk(req.params.id, { transaction });

    if (!users) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    if (req.body.name && req.body.name !== users.name) {
      const exists = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.fn('LOWER', req.body.name)
        ),
        transaction
      });

      if (exists) {
        await transaction.rollback();
        return res.status(409).json({ success: false, erro: "Nama user sudah terdaftar" });
      }
    }

    let imgurData = {};
    if (req.file) {
      if (users.delete_hash) {
        try {
          await deleteFromImgur(users.delete_hash);
        } catch (err) {
          console.warn('Gagal hapus gambar lama di imgur:', err);
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

        const updateData = { ...req.body };

        if (req.file) {
          updateData.profile_url = imgurData.image_url;
          updateData.delete_hash = imgurData.delete_hash;
        } else {
          delete updateData.profile_url;
          delete updateData.delete_hash;
        }

        await users.update(updateData, { transaction });
        await transaction.commit();

        const updateUser = await User.findByPk(req.params.id);

        return res.status(200).json({ success: true, data: updateUser });
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: error.message });
      }
    };

    const deleteUser = async (req, res) => {
      const { sequelize } = User;
      let transaction;
      
      try {
          const { id } = req.params;
    
          transaction = await sequelize.transaction();
    
          const users = await User.findByPk(id, { transaction });
    
          if (!users) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: "Seiyu tidak ditemukan" });
          }
    
          if (users.delete_hash) {
            try {
            await deleteFromImgur(users.delete_hash);
          } catch (imgurError) {
            await transaction.rollback();
            return res.status(500).json({ success: false, error: "Gagal menghapus gambar", details: imgurError.message });
          }
        }
    
          await users.destroy({ transaction });
    
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
  registerUser,
  loginUser,
  getAllUser,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser
};