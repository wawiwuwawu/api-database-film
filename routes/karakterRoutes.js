// routes/karakterRoutes.js
const express = require('express');
const router = express.Router();
const {
  createKarakter,
  getAllKarakter,
  getKarakterDetail
} = require('../controllers/karakterController');


router.post('/upKarakter', upload.single('image'), createKarakter);
router.get('/', getAllKarakter);
router.get('/:id', getKarakterDetail);

module.exports = router;
