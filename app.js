require('dotenv').config();
console.log(process.env.DB_HOST);
const multer = require('multer');
const express = require('express');
const path    = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { uploadToImgur } = require('./config/imgur.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const app = express();
const PORT = process.env.PORT || 5000;
// set body parser
app.use(cors({
  origin: 'https://web.wawunime.my.id',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));





// Register Endpoint
app.post('/api/auth/register', 
    [
      body('nama').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Invalid email format'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
      try {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const { nama, email, password } = req.body;
  
        // Cek email sudah terdaftar
        const [existingUser] = await koneksi.query(
          'SELECT * FROM users WHERE email = ?', 
          [email]
        );
        
        if (existingUser.length > 0) {
          return res.status(400).json({ 
            message: 'Email already exists!' 
          });
        }
  
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
  
        // Simpan ke database
        const [result] = await koneksi.query(
          `INSERT INTO users 
          (nama, email, password, role) 
          VALUES (?, ?, ?, 'customer')`,
          [nama, email, hashedPassword, 'customer']
        );
  
        // Generate JWT
        const token = jwt.sign(
          { userId: result.insertId, role: 'customer' },
          process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
          { expiresIn: '1h' }
        );
  
        res.status(201).json({
          message: 'User registered successfully!',
          token
        });
  
      } catch (error) {
        console.error('Error detail:', {
            message: error.message,
            stack: error.stack,
            sqlMassage: error.sqlMessage
        });
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );



// Login Endpoint
app.post('/api/auth/login',
    [
      body('email').isEmail().withMessage('Invalid email format'),
      body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
      try {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const { email, password } = req.body;
  
        // Cari user
        const [users] = await koneksi.query(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );
        
        if (users.length === 0) {
          return res.status(401).json({ 
            message: 'Invalid credentials' 
          });
        }
  
        const user = users[0];
  
        // Verifikasi password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ 
            message: 'Invalid credentials' 
          });
        }
  
        // Generate JWT
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
          { expiresIn: '1h' }
        );
  
        res.status(200).json({
          message: 'Login successful',
          token
        });
  
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );





  const upload = multer({ 
    dest: 'uploads/' // Folder sementara untuk simpan file sebelum diupload ke GDrive
  });
  
  // Route untuk upload
  app.post('/api/upload', upload.single('cover'),
          [
            body('judul').trim().notEmpty().withMessage('Judul tidak boleh kosong'),
            body('sinopsis').trim().notEmpty().withMessage('Sinopsis tidak boleh kosong'),
            body('tahun_rilis').trim().notEmpty().isLength({ min: 4, max: 4 }).withMessage('Tahun rilis harus 4 digit'),
            body('episode').trim().notEmpty().isInt({ min: 1 }).withMessage('masukan angka episode yang valid'),
            body('durasi').trim().notEmpty().isInt({ min: 1 }).withMessage('masukan angka durasi yang valid'),
            body('type').trim().notEmpty().isIn(['TV', 'Movie', 'ONA', 'OVA']).withMessage('Type harus valid (TV, Movie, ONA, OVA)'),
            body('rating').trim().notEmpty().isIn(['G', 'PG', 'PG-13', 'R']).withMessage('Type harus valid (G, PG, PG-13, R)'),
          ],
  async (req, res) => {
    try {
      // Validasi input (gunakan express-validator)
      if (!req.file) {
        return res.status(400).json({ error: 'File cover wajib diupload' });
      }
  
      // Upload ke imgur
      const { url: coverUrl, deleteHash } = await uploadToImgur(req.file);
  
      // Simpan data ke database
      const [result] = await koneksi.query(
        `INSERT INTO movies (judul, sinopsis, tahun_rilis, type, episode, durasi, rating, cover_url, delete_hash) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.judul,
          req.body.sinopsis,
          req.body.tahun_rilis,
          req.body.type,
          req.body.episode || null,
          req.body.durasi,
          req.body.rating,
          coverUrl,
          deleteHash
        ]
      );
  
      res.json({ 
        success: true,
        message: 'Data berhasil disimpan',
        movieId: result.insertId,
        coverUrl 
      });
  
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });