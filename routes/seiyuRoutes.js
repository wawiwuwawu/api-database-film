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
  updateSeiyu,
  deleteSeiyu
} = require("../controllers/seiyuController");

// POST   /api/seiyu/         → createSeiyu
router.post("/", upload.single('file'), seiyuValidationRules, createSeiyu);

// GET    /api/seiyu/         → getAllSeiyus
router.get("/", getAllSeiyus);

// GET    /api/seiyu/:id      → getSeiyuById (dengan relasi karakter & movie)
router.get("/:id", getSeiyuById);

// PUT    /api/seiyu/:id      → updateSeiyu
router.put("/:id", upload.single('file'), seiyuUpdateValidationRules, updateSeiyu);

// DELETE /api/seiyu/:id      → deleteSeiyus
router.delete("/:id", deleteSeiyu);

module.exports = router;
