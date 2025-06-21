const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const { validationResult } = require('express-validator');
const { User, sequelize } = require('../models');
const { deleteFromImgur, uploadToImgur } = require('../config/imgur');
const { sendOTPEmail } = require('../config/otp_email'); // Uncomment if you use OTP email
const bcrypt = require('bcrypt');


const registerUser = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validasi gagal", error: error.array() });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        if (existingUser.isVerified) {

            return res.status(409).json({ message: 'Email sudah terdaftar. Silakan login.' });
        } else {

            console.log(`Email ${email} mencoba mendaftar ulang, mengirim ulang OTP...`);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiryTime = new Date(new Date().getTime() + 5 * 60000);

            await existingUser.update({ otp: otp, otpExpires: expiryTime });

            await sendOTPEmail(email, otp);

            return res.status(200).json({ message: 'Email sudah terdaftar tapi belum aktif. Kode verifikasi baru telah dikirim.' });
        }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(new Date().getTime() + 10 * 60000);

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'customer',
      otp: otp,
      otpExpires: expiryTime
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil, silakan verifikasi OTP yang dikirim ke email Anda.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registrasi error:', error.message);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};


const loginUser = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validasi gagal", error: error.array() });
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

    if (!user.isVerified) {
        return res.status(403).json({ 
            message: 'Akun Anda belum diverifikasi. Silakan cek email Anda untuk kode OTP.',
            resendOtp: true 
        });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({ success: true, message: 'Login berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_url: user.profile_url,
        role: user.role
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

const getCurrentUser = async (req, res) => {

  const userId = req.user.userId;

  const user = await User.findByPk(userId, {
    attributes: ['id','name','email','role', 'bio','profile_url']
  });

  return res.json({ success: true, data: user });
}

const updateUser = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", error: error.array() });
  }

  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
  }

  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    // Cek duplikasi nama jika diubah
    if (req.body.name && req.body.name !== user.name) {
      const exists = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.fn('LOWER', req.body.name)
        ),
        transaction
      });
      if (exists) {
        await transaction.rollback();
        return res.status(409).json({ success: false, error: "Nama user sudah terdaftar" });
      }
    }

    let imgurData = {};
    if (req.file) {
      if (user.delete_hash) {
        try {
          await deleteFromImgur(user.delete_hash);
        } catch (error) {
          console.warn('Gagal hapus gambar lama di imgur:', error);
        }
      }
      try {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: `Gagal upload gambar baru: ${error.message}` });
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

    await user.update(updateData, { transaction });
    await transaction.commit();

    const updatedUser = await User.findByPk(req.params.id);
    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    transaction = await sequelize.transaction();
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }
    if (user.delete_hash) {
      try {
        await deleteFromImgur(user.delete_hash);
      } catch (imgurError) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: "Gagal menghapus gambar", details: imgurError.message });
      }
    }
    await user.destroy({ transaction });
    await transaction.commit();
    return res.status(200).json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};

const verifyOtpAndLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email diperlukan." });
        }
        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan." });
        }
        // Jika admin, langsung login tanpa OTP
        if (user.role === 'admin') {
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
                { expiresIn: '1h' }
            );
            return res.status(200).json({ success: true, message: "Login admin berhasil!", token });
        }
        // Untuk user biasa, cek OTP dan expired
        if (!otp || !user.otp || !user.otpExpires || user.otp !== otp || new Date() > user.otpExpires) {
            // Hapus user jika OTP gagal diverifikasi
            await user.destroy();
            return res.status(400).json({ success: false, message: "OTP salah atau sudah kadaluarsa. Akun Anda telah dihapus, silakan registrasi ulang." });
        }

        // OTP valid, update status verifikasi dan kosongkan OTP
        await user.update({
          otp: null,
          otpExpires: null,
          isVerified: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
            { expiresIn: '1h' }
        );
        res.status(200).json({ success: true, message: "Login berhasil!", token });
    } catch (error) {
        console.error("Error di fungsi verifyOtpAndLogin:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email diperlukan.' });
        }

        // 1. Cari user yang sudah ada di database
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            // Jika karena suatu hal user tidak ditemukan, kirim error
            return res.status(404).json({ message: 'Email ini tidak terdaftar.' });
        }

        // 2. Buat OTP baru dan waktu kedaluwarsa baru
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(new Date().getTime() + 5 * 60000); // 5 menit dari sekarang

        // 3. Update record user tersebut dengan OTP yang baru
        await user.update({
            otp: otp,
            otpExpires: expiryTime
        });

        // 4. Kirim email berisi OTP yang baru
        await sendOTPEmail(email, otp);

        // 5. Kirim respons sukses
        res.status(200).json({ message: 'Kode OTP baru telah berhasil dikirim ulang.' });

    } catch (error) {
        console.error("Error di fungsi resendOtp:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email diperlukan.' });
        }

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            console.log(`Permintaan reset password untuk email tidak terdaftar: ${email}`);
            return res.status(200).json({ message: 'Jika email Anda terdaftar, Anda akan menerima kode reset password.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(new Date().getTime() + 5 * 60000);

        await user.update({ otp: otp, otpExpires: expiryTime });

        await sendOTPEmail(email, otp, "Reset Password");

        res.status(200).json({ message: 'Jika email Anda terdaftar, Anda akan menerima kode reset password.' });

    } catch (error) {
        console.error("Error di forgotPassword:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, dan password baru diperlukan." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password baru minimal 6 karakter." });
        }

        // 1. Cari user
        const user = await User.findOne({ where: { email: email } });

        // 2. Verifikasi OTP (sama seperti di fungsi login)
        if (!user || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "Kode OTP salah, tidak valid, atau telah kedaluwarsa." });
        }

        // 3. Jika OTP benar, update password baru (hash otomatis oleh model)
        await user.update({
            password: newPassword,
            otp: null,
            otpExpires: null
        });

        res.status(200).json({ message: "Password Anda telah berhasil direset. Silakan login." });

    } catch (error) {
        console.error("Error di resetPassword:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

const updateCurrentUser = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", error: error.array() });
  }

  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Format file harus JPG/PNG' });
  }

  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    // Cek duplikasi nama jika diubah
    if (req.body.name && req.body.name !== user.name) {
      const exists = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.fn('LOWER', req.body.name)
        ),
        transaction
      });
      if (exists) {
        await transaction.rollback();
        return res.status(409).json({ success: false, error: "Nama user sudah terdaftar" });
      }
    }

    let imgurData = {};
    if (req.file) {
      if (user.delete_hash) {
        try {
          await deleteFromImgur(user.delete_hash);
        } catch (error) {
          console.warn('Gagal hapus gambar lama di imgur:', error);
        }
      }
      try {
        imgurData = await uploadToImgur({ buffer: req.file.buffer });
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: `Gagal upload gambar baru: ${error.message}` });
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

    await user.update(updateData, { transaction });
    await transaction.commit();

    const updatedUser = await User.findByPk(userId);
    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteCurrentUser = async (req, res) => {
  let transaction;
  try {
    const userId = req.user.userId;
    transaction = await sequelize.transaction();
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }
    if (user.delete_hash) {
      try {
        await deleteFromImgur(user.delete_hash);
      } catch (imgurError) {
        await transaction.rollback();
        return res.status(500).json({ success: false, error: "Gagal menghapus gambar", details: imgurError.message });
      }
    }
    await user.destroy({ transaction });
    await transaction.commit();
    return res.status(200).json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    if (transaction) await transaction.rollback();
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
  deleteUser,
  verifyOtpAndLogin,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateCurrentUser,
  deleteCurrentUser
};