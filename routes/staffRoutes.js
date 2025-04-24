const express = require("express");
const router = express.Router();
const { 
  createStaffValidationRules,
  updateStaffValidationRules 
} = require("../middlewares/validation");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');


router.post("/", upload.single('file'), createStaffValidationRules, createStaff);
router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.put("/:id", upload.single('file'), updateStaffValidationRules, updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;