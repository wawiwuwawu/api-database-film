// routes/karakterRoutes.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const rateLimit = require('express-rate-limit');

const {
  createKarakter, 
  getAllKarakter, 
  getKarakterById,
  getKarakterDetail,
  getKarakterDetailById,
  getKarakterSeiyu,
  getKarakterSeiyuById,
  getKarakterMovie,
  getKarakterMovieById,
  getKarakterByName,
  updateKarakter,
  deleteKarater
} = require('../controllers/karakterController');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
  keyGenerator: (req) => req.ip,
});

const limiterPerSecond = rateLimit({
  windowMs: 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu cepat, tunggu sebentar.' },
  keyGenerator: (req) => req.ip,
});

router.use(limiter);
router.use(limiterPerSecond);

router.get('/detail', getKarakterDetail);
router.get('/detail/:id', getKarakterDetailById);

router.get('/seiyu', getKarakterSeiyu);
router.get('/seiyu/:id', getKarakterSeiyuById);

router.get('/movie', getKarakterMovie);
router.get('/movie/:id', getKarakterMovieById);

router.get('/search', getKarakterByName);

router.post('/', upload.single('file'), createKarakter);

router.get('/', getAllKarakter);

router.put('/:id', upload.single('file'), updateKarakter);

router.get('/:id', getKarakterById);

router.delete('/:id', deleteKarater);

module.exports = router;



