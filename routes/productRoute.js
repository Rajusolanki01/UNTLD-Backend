const express = require("express");
const router = express.Router();
const {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateaProduct,
  deleteaProduct,
  addToWishList,
  rating,
} = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

router.get("/:id", getSingleProduct);
router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/", getAllProduct);
router.put("/wishlist", authMiddleware, addToWishList);
router.delete("/:id", authMiddleware, isAdmin, deleteaProduct);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware, isAdmin, updateaProduct);

module.exports = router;
