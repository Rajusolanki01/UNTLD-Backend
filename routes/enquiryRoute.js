const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
} = require("../controllers/enquiryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();


router.get("/:id", authMiddleware, getEnquiry);
router.get("/", authMiddleware, getallEnquiry);
router.post("/", authMiddleware, createEnquiry);
router.put("/:id", authMiddleware, isAdmin, updateEnquiry);
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry);

module.exports = router;
