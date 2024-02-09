const { error, success } = require("../middlewares/responseWrapper");
const BlogCategory = require("../models/blogCategoryModel");
const ValidateMongoDbId = require("../utils/validateMongodbId");

const createBlogCategory = async (req, res) => {
  try {
    const newCategory = await BlogCategory.create(req.body);
    return res.send(success(200, newCategory));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};
const updateBlogCategory = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.send(success(200, updatedCategory));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};
const deleteBlogCategory = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const deletedCategory = await BlogCategory.findByIdAndDelete(id);
    return res.send(success(200, "BlogCategory is Deleted"));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};
const getBlogCategory = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const getaCategory = await BlogCategory.findById(id);
    return res.send(success(200, getaCategory));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};
const getallBlogCategory = async (req, res) => {
  try {
    const getallCategory = await BlogCategory.find();
    return res.send(success(200, getallCategory));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};
module.exports = {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogCategory,
  getallBlogCategory,
};