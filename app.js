require('dotenv').config();
console.log(process.env.DB_HOST);
const multer = require('multer');
const express = require('express');
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


// Konfigurasi Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Format file tidak valid'));
  }
}).single('cover');




// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
      code: err.code
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});




// Endpoint Upload
app.post('/upload', upload.single('cover'), async (req, res) => {
  try {
    // Validasi Input
    const requiredFields = ['judul', 'tahun_file', 'durasi', 'rating'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Field wajib diisi: ${missingFields.join(', ')}`);
    }

    // Validasi File
    if (!req.file) {
      throw new Error('File cover wajib diupload');
    }

    // Validasi Tipe File
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error('Format file tidak didukung (hanya JPEG/PNG/WEBP)');
    }

    // Validasi Ukuran File
    if (req.file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file melebihi 5MB');
    }

    // Proses Database
    const result = await db.promise().query(
      `INSERT INTO movies (...) VALUES (...)`,
      [/* values */]
    );

    res.json({
      message: 'Data berhasil disimpan',
      coverUrl: req.file.url,
      movieId: result[0].insertId
    });

  } catch (error) {
    console.error('Upload Error:', error);
    
    // Hapus file yang sudah terupload jika ada error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(400).json({
      message: error.message,
      errorType: error.name
    });
  }
});


