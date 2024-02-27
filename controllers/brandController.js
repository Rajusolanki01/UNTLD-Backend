const { error, success } = require("../middlewares/responseWrapper");
const Brand = require("../models/brandModel");
const ValidateMongoDbId = require("../utils/validateMongodbId");

const createBrand = async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    return res.send(success(201, `${newBrand.title} is Added`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updatedBrand) {
      return res.send(success(201, `${updatedBrand.title} Brand is Update`));
    } else {
      return res.send(error(403, "There is no Brand"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
const deleteBrand = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);
    return res.send(success(201, `${deletedBrand.title} Brand is Deleted`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
const getBrand = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const getaBrand = await Brand.findById(id);
    return res.send(success(200, getaBrand));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
const getallBrand = async (req, res) => {
  try {
    const getallBrand = await Brand.find();
    return res.send(success(200, getallBrand));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
};
