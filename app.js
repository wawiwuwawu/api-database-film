require('dotenv').config();
console.log(process.env.DB_HOST);



const cors = require('cors');
const express = require('express');
const sequelize = require('./config/sequelize');


const admin = require('./config/firebase');
const userRoutes = require('./routes/userRoutes');
const karakterRoutes = require('./routes/karakterRoutes');
const movieRoutes = require('./routes/movieRoutes');
const seiyuRoutes = require('./routes/seiyuRoutes');
const staffRoutes = require('./routes/staffRoutes');
const genreRoutes = require('./routes/genreRoutes');
const themeRoutes = require('./routes/themeRoutes');
const listRoutes = require('./routes/listRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// set body parser

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', userRoutes);
app.use('/api/karakter', karakterRoutes);
app.use('/api/movie', movieRoutes);
app.use('/api/seiyu', seiyuRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/genre', genreRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/list', listRoutes);




sequelize.sync({ alter: true, logging: console.log })
  .then(() => console.log('Database synced!'))
  .catch(err => console.error('Sync error:', err));
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));







