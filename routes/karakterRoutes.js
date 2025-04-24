// routes/karakterRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllKarakter,
  getKarakterDetail
} = require('../controllers/karakterController');

// GET: Ambil semua karakter
router.get('/', getAllKarakter);

// GET: Ambil detail karakter berdasarkan ID, termasuk movies dan seiyu
router.get('/:id', getKarakterDetail);

module.exports = router;
