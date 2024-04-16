const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const { success, error } = require("../middlewares/responseWrapper");

dotenv.config("");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECERT_KEY_ID,
});

const checkout = async (req, res) => {
  try {
    const { amount } = req.body;
    const option = {
      amount: amount * 100,
      currency: "INR",
    };

    const order = await instance.orders.create(option);
    return res.send(success(200, order));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const paymentVerifiction = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId } = req.body;
    return res.send(
      success(200, {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
      })
    );
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  checkout,
  paymentVerifiction,
};
