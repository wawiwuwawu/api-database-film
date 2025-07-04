// routes/seiyuRoutes.js
const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { 
  seiyuValidationRules,
  seiyuUpdateValidationRules 
} = require("../middlewares/validation");

const {
  createSeiyu,
  getAllSeiyus,
  getSeiyuById,
  getAllSeiyusDetail,
  getSeiyusDetailById,
  getAllSeiyusKarakter,
  getSeiyusKarakterById,
  getAllSeiyusMovie,
  getSeiyusMovieById,
  getSeiyuByName,
  updateSeiyu,
  deleteSeiyu
} = require("../controllers/seiyuController");

const rateLimit = require('express-rate-limit');

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

router.get("/detail", getAllSeiyusDetail);
router.get("/detail/:id", getSeiyusDetailById);

router.get("/karakter", getAllSeiyusKarakter);
router.get("/karakter/:id", getSeiyusKarakterById);

router.get("/movie", getAllSeiyusMovie);
router.get("/movie/:id", getSeiyusMovieById);

router.get("/search", getSeiyuByName);

router.post("/", upload.single('file'), seiyuValidationRules, createSeiyu);

router.get("/", getAllSeiyus);

router.get("/:id", getSeiyuById);

router.put("/:id", upload.single('file'), seiyuUpdateValidationRules, updateSeiyu);

router.delete("/:id", deleteSeiyu);

module.exports = router;
