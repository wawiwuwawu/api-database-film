require('dotenv').config();
console.log(process.env.DB_HOST);
const { google } = require('googleapis');
const multer = require('multer');
const express = require('express');
const path    = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { uploadToGoogleDrive } = require('./config/googleDrive');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const app = express();
const PORT = process.env.PORT || 5000;
// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

const CLIENT_ID = '596906828762-ihco36jj00mepv1poa3ldi5coallrh4r.apps.googleusercontent.com'
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04WjUYB-KMDmiCgYIARAAGAQSNwF-L9IrYW7HlQzXLLdf-oecx3Bz7EflEyhYwnxKCLKRbB5anCSbG121MkU0tItv7VNw1yHnFqA';


// Konfigurasi OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({ version: 'v3', auth: oauth2Client });



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





  const storage = multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  const upload = multer({ storage });
  
  // Upload route
  app.post(
    '/api/upload',
    upload.single('cover'),
    [
      body('judul').notEmpty(),
      body('sinopsis').notEmpty(),
      body('tahun_rilis').isInt({ min: 1900, max: 2100 }),
      body('type').isIn(['TV','Movie','ONA','OVA']),
      body('durasi').isInt(),
      body('rating').isIn(['G','PG','PG-13','R','NC-17'])
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        if (!req.file) {
          return res.status(400).json({ message: 'File cover wajib diupload' });
        }
  
        // ▶️ Panggil fungsi hasil impor, bukan yang dideklarasi ulang
        const coverUrl = await uploadToGoogleDrive(req.file);
  
        const [result] = await koneksi.promise().query(
          `INSERT INTO movies 
           (judul,sinopsis,tahun_rilis,type,episode,durasi,rating,cover_url)
           VALUES (?,?,?,?,?,?,?,?)`,
          [
            req.body.judul,
            req.body.sinopsis,
            req.body.tahun_rilis,
            req.body.type,
            req.body.episode||null,
            req.body.durasi,
            req.body.rating,
            coverUrl
          ]
        );
        res.json({ message: 'Data berhasil disimpan', coverUrl, movieId: result.insertId });
      } catch (err) {
        next(err);
      }
    }
  );
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message, code: err.code });
    }
    res.status(500).json({ message: err.message });
  });