const { error, success } = require("../middlewares/responseWrapper");
const fs = require("fs");

const {
  cloudinaryDeleteImg,
  cloudinaryUploadsImg,
} = require("../utils/cloudinary");

const uploadImages = async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadsImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      try {
        fs.unlinkSync(path);
      } catch (error) {}
    }
    const images = urls.map((file) => {
      return file;
    });
    return res.send(success(200, images));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const deleteImages = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImg(id, "images");
    return res.send(success(200, "Images Deleted"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  uploadImages,
  deleteImages,
};
