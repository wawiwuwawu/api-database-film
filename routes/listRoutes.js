const express = require("express");
const router = express.Router();
const { 
    saveList,
    deleteList,
    getUserList
} = require("../controllers/listController");

router.post("/", saveList);
router.delete("/:userId/:movieId", deleteList);
router.get("/:userId", getUserList);

module.exports = router;