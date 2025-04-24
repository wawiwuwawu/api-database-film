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
  getAllSeiyusKarakter,
  getSeiyuById,
  updateSeiyu,
  deleteSeiyu
} = require("../controllers/seiyuController");


router.post("/", upload.single('file'), seiyuValidationRules, createSeiyu);
router.get("/", getAllSeiyus);
router.get("/karakter", getAllSeiyusKarakter);
router.get("/:id", getSeiyuById);
router.put("/:id", upload.single('file'), seiyuUpdateValidationRules, updateSeiyu);
router.delete("/:id", deleteSeiyu);

module.exports = router;
