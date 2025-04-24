const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Cek email terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email sudah terdaftar" 
      });
    }

    // Create user dengan model
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    // Generate JWT dengan fallback secret
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
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Cari user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid'
      });
    }

    // Verifikasi password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid'
      });
    }

    // Generate JWT dengan fallback
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
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
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};