require('dotenv').config();
console.log(process.env.DB_HOST);
const multer = require('multer');
const express = require('express');
const path    = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;
// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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





// 1) Definisikan storage sebelum membuat middleware upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder 'uploads/' sudah ada, atau buat dulu dengan fs.mkdirSync
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});



// 2) Buat middleware upload sekali saja
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const okMime = allowed.test(file.mimetype);
    const okExt  = allowed.test(path.extname(file.originalname).toLowerCase());
    if (okMime && okExt) return cb(null, true);
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Format file tidak valid'));
  }
});


// 4) Endpoint Upload
//    Jangan panggil .single lagi di sini karena sudah diset di middleware 'upload'
app.post(
  '/api/upload',
  upload.single('cover'),
  [
    body('judul').notEmpty(),
    body('tahun_file').isInt(),
    body('durasi').notEmpty(),
    body('rating').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'File cover wajib diupload' });
      }

      const [result] = await db.promise().query(
        `INSERT INTO movies (judul, tahun_file, durasi, rating, cover_path)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.body.judul,
          req.body.tahun_file,
          req.body.durasi,
          req.body.rating,
          req.file.filename
        ]
      );

      res.json({
        message: 'Data berhasil disimpan',
        coverUrl: `/uploads/${req.file.filename}`,
        movieId: result.insertId
      });

    } catch (err) {
      next(err);
    }
  }
);

// 5) Error Handling Middleware (harus di akhir)
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    // Kesalahan spesifik Multer
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
      code: err.code
    });
  }

  // Lain‑lain
  res.status(500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
