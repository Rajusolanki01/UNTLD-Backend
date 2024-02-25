const express = require("express");
const {
  uploadImages,
  deleteImages,
} = require("../controllers/uploadImageController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhotos,
  productImageResize,
} = require("../middlewares/uploadImagesMiddleware");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhotos.array("images", 10),
  productImageResize,
  uploadImages
);

router.delete("/delete-image/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;
