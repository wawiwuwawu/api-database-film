require('dotenv').config();
console.log(process.env.DB_HOST);



const cors = require('cors');
const express = require('express');
const sequelize = require('./config/sequelize');


const userRoutes = require('./routes/userRoutes');
const karakterRoutes = require('./routes/karakterRoutes');
const movieRoutes = require('./routes/movieRoutes');
const seiyuRoutes = require('./routes/seiyuRoutes');
const staffRoutes = require('./routes/staffRoutes');
const genreRoutes = require('./routes/genreRoutes');
const themeRoutes = require('./routes/themeRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
// set body parser

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', userRoutes);
app.use('/api/karakter', karakterRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/seiyus', seiyuRoutes);
app.use('/api/staffs', staffRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/themes', themeRoutes);




sequelize.sync({ alter: true, logging: console.log })
  .then(() => console.log('Database synced!'))
  .catch(err => console.error('Sync error:', err));
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));





// app.post('/api/auth/register', 
//   [
//     body('nama').notEmpty().withMessage('Name is required'),
//     body('email').isEmail().withMessage('Invalid email format'),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
//   ],
//   async (req, res) => {
//     try {
//       // Validasi input
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { nama, email, password } = req.body;

//       // Cek email sudah terdaftar
//       const [existingUser] = await koneksi.query(
//         'SELECT * FROM users WHERE email = ?', 
//         [email]
//       );
      
//       if (existingUser.length > 0) {
//         return res.status(400).json({ 
//           message: 'Email already exists!' 
//         });
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 12);

//       // Simpan ke database
//       const [result] = await koneksi.query(
//         `INSERT INTO users 
//         (nama, email, password, role) 
//         VALUES (?, ?, ?, 'customer')`,
//         [nama, email, hashedPassword, 'customer']
//       );

//       // Generate JWT
//       const token = jwt.sign(
//         { userId: result.insertId, role: 'customer' },
//         process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
//         { expiresIn: '1h' }
//       );

//       res.status(201).json({
//         message: 'User registered successfully!',
//         token
//       });

//     } catch (error) {
//       console.error('Error detail:', {
//           message: error.message,
//           stack: error.stack,
//           sqlMassage: error.sqlMessage
//       });
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// );



// // Login Endpoint
// app.post('/api/auth/login',
//   [
//     body('email').isEmail().withMessage('Invalid email format'),
//     body('password').notEmpty().withMessage('Password is required')
//   ],
//   async (req, res) => {
//     try {
//       // Validasi input
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { email, password } = req.body;

//       // Cari user
//       const [users] = await koneksi.query(
//         'SELECT * FROM users WHERE email = ?',
//         [email]
//       );
      
//       if (users.length === 0) {
//         return res.status(401).json({ 
//           message: 'Invalid credentials' 
//         });
//       }

//       const user = users[0];

//       // Verifikasi password
//       const isValidPassword = await bcrypt.compare(password, user.password);
//       if (!isValidPassword) {
//         return res.status(401).json({ 
//           message: 'Invalid credentials' 
//         });
//       }

//       // Generate JWT
//       const token = jwt.sign(
//         { userId: user.id, role: user.role },
//         process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini',
//         { expiresIn: '1h' }
//       );

//       res.status(200).json({
//         message: 'Login successful',
//         token
//       });

//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// );





