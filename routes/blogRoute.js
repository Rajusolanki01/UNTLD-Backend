const express = require("express");
const {
  createBlog,
  updateBlog,
  getaBlog,
  getAllBlogs,
  deleteaBlog,
  likeTheBlog,
  dislikeTheBlog,
  uploadImages,
} = require("../controllers/blogController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  uploadPhotos,
  blogImageResize,
} = require("../middlewares/uploadImagesMiddleware");

const router = express.Router();

router.post(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhotos.array("images", 10),
  blogImageResize,
  uploadImages
);


router.get("/:id", getaBlog);
router.post("/", authMiddleware, isAdmin, createBlog);
router.put("/likes", authMiddleware, likeTheBlog);
router.put("/dislikes", authMiddleware, dislikeTheBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleware, isAdmin, deleteaBlog);

module.exports = router;
