const { error, success } = require("../middlewares/responseWrapper");
const Enquiry = require("../models/enquiryModel");
const User = require("../models/userModel");
const ValidateMongoDbId = require("../utils/validateMongodbId");

const createEnquiry = async (req, res) => {
  try {
    const createEnquiry = await Enquiry.create(req.body);
    return res.send(success(201, `${createEnquiry.name} Enquiry is create`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const updateEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updateEnquiry) {
      return res.send(success(201, `${updateEnquiry.name} Enquiry is update`));
    } else {
      return res.send(error(403, "There is no Enquiry"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const deleteEnquiry = await Enquiry.findByIdAndDelete(id);
    return res.send(success(201, `${deleteEnquiry.name} enquiry is delete`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const enquiry = await Enquiry.findById(id).populate("user");
    if (!enquiry) {
      return res.send(error(404, "Enquiry not found"));
    }
    const user = await User.findOne({ email: enquiry.email });
    if (!user) {
      return res.send(error(404, "User not found"));
    }
    enquiry.user = user;
    return res.send(success(200, enquiry));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getallEnquiry = async (req, res) => {
  try {
    const getallEnquiry = await Enquiry.find();
    return res.send(success(200, getallEnquiry));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
};
