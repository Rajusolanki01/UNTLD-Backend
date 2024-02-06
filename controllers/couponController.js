const { error, success } = require("../middlewares/responseWrapper");
const Coupon = require("../models/couponModel");
const ValidateMongoDbId = require("../utils/validateMongodbId");

const createCoupon = async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    return res.send(success(201, newCoupon));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    return res.send(success(200, coupons));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const getAcoupon = await Coupon.findById(id);
    return res.send(success(200, getAcoupon));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const updateCoupon = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.send(success(200, updatedCoupon));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  ValidateMongoDbId(id);
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    return res.send(success(200, "Coupon is Deleted"));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
};
