const { error, success } = require("../middlewares/responseWrapper");
const Color = require("../models/colorModel");
const ValidateMongoDbId = require("../utils/validateMongodbId");

const createColor = async (req, res) => {
  try {
    const newColor = await Color.create(req.body);
    return res.send(success(200, newColor));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};


const updateColor = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.send(success(200, updatedColor));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};


const getColor = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const getaColor = await Color.findById(id);
    return res.send(success(200, getaColor));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const getallColor = async (req, res) => {
  try {
    const getallColor = await Color.find();
    return res.send(success(200, getallColor));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const deleteColor = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const deletedColor = await Color.findByIdAndDelete(id);
    return res.send(success(200, `${deletedColor.title} Color is Deleted`));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};
module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getallColor,
};
