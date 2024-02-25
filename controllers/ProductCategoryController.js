const { error, success } = require("../middlewares/responseWrapper");
const Category = require("../models/productCategoryModel");
const ValidateMongoDbId = require("../utils/validateMongodbId");

const createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    return res.send(success(201, `${newCategory.title} category is create`));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.send(success(201, `${updatedCategory.title} category is update`));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const deletedCategory = await Category.findByIdAndDelete(id);
    return res.send(success(201, `${deletedCategory.title} is delete`));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const getaCategory = await Category.findById(id);
    return res.send(success(200, getaCategory));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const getallCategory = async (req, res) => {
  try {
    const getallCategory = await Category.find();
    return res.send(success(200, getallCategory));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
};
