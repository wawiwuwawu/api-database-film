// routes/karakterRoutes.js
const express = require('express');
const router = express.Router();
const {
  createKarakter,
  getAllKarakter,
  getKarakterDetail,
  deleteKarater
} = require('../controllers/karakterController');


router.post('/upKarakter', upload.single('image'), createKarakter);
router.get('/', getAllKarakter);
router.get('/:id', getKarakterDetail);
router.delete('/:id', deleteKarater);

module.exports = router;
