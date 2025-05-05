// routes/karakterRoutes.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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



