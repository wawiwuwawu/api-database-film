const express = require("express");
const router = express.Router();
const { 
  createStaffValidationRules,
  updateStaffValidationRules 
} = require("../middlewares/validation");
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');

// POST: Create staff
router.post("/", createStaffValidationRules, createStaff);

// GET: Get all staff
router.get("/", getAllStaff);

// GET: Get staff by ID
router.get("/:id", getStaffById);

// PUT: Update staff by ID
router.put("/:id", updateStaffValidationRules, updateStaff);

// DELETE: Delete staff by ID
router.delete("/:id", deleteStaff);

module.exports = router;