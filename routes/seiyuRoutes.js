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
