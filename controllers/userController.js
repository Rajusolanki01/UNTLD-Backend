const {
  generateJwtToken,
  generateJwtRefreshToken,
} = require("../config/jwttoken");
const { error, success } = require("../middlewares/responseWrapper");
const User = require("../models/userModel");
const ValidateMongoDbId = require("../utils/validateMongodbId.js");
const jwt = require("jsonwebtoken");
const sendEmails = require("./emailController");
const crypto = require("crypto");
const Address = require("../models/addressModel");
const Carts = require("../models/cartModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const dotenv = require("dotenv");

dotenv.config();

const { UNTLD_BASE_URLL_VARCEL, UNTLD_ADMIN_BASE_URLL } = process.env;
//* Create & Login Auth User Api's *//

const createUser = async (req, res) => {
  try {
    const email = req.body.email;

    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      const newUser = await User.create(req.body);
      return res.send(
        success(
          201,
          `${newUser.firstname} ${newUser.lastname} account is create `
        )
      );
    } else {
      return res.send(error(409, "User is Already Registered"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.send(error(409, "User is Not Registered"));
    }

    if (findUser.isBlocked) {
      return res.send(error(403, "Sorry You are blocked by the UNTLD. Admin"));
    }

    const refreshToken = await generateJwtRefreshToken({
      _id: findUser._id,
      email: findUser.email,
    });

    const updatedUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      return res.send(
        success(200, {
          _id: findUser?._id,
          firstname: findUser?.firstname,
          lastname: findUser?.lastname,
          email: findUser?.email,
          mobile: findUser?.mobile,
          accessToken: generateJwtToken({
            _id: findUser._id,
            email: findUser.email,
          }),
        })
      );
    } else {
      return res.send(error(403, "Invalid Credentials"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Admin Login *//

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(409, "Email And Password Required"));
    }

    //* Check if user is exists or not

    const findAdmin = await User.findOne({ email });

    if (findAdmin.role !== "admin")
      return res.send(error(409, "Your're not an Admin"));

    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
      const refreshToken = await generateJwtRefreshToken({
        _id: findAdmin._id,
        email: findAdmin.email,
      });

      const updateUser = await User.findByIdAndUpdate(
        findAdmin.id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      return res.send(
        success(200, {
          _id: findAdmin._id,
          firstname: findAdmin.firstname,
          lastname: findAdmin.lastname,
          email: findAdmin.email,
          mobile: findAdmin.mobile,
          accessToken: generateJwtToken({
            _id: findAdmin._id,
            email: findAdmin.email,
          }),
        })
      );
    } else {
      return res.send(error(409, "Invalid Credentials"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Handle Refresh Token  *//

const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return res.send(error(409, "Refresh Token in cookie is Required"));
  }

  const refreshToken = cookies.refreshToken;
  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.send(
        error(401, "No Refresh token present in User db or not matched")
      );
    }

    jwt.verify(refreshToken, process.env.JWT_SECERT_TOKEN, (err, decoded) => {
      if (err || user._id.toString() !== decoded._id) {
        return res.send(
          error(401, "There is something wrong with refresh token")
        );
      }

      const accessToken = generateJwtToken({
        _id: user._id,
        email: user.email,
      });
      return res.send(success(200, accessToken));
    });
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Handle Save Address Controller *//

const saveAddress = async (req, res) => {
  try {
    const { _id } = req.user;
    ValidateMongoDbId(_id);
    const createAddress = await Address.create(req.body);

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $push: { address: createAddress },
      },
      {
        new: true,
      }
    );

    return res.send(success(201, updatedUser));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Get All User's *//

const getAllUser = async (req, res) => {
  try {
    const getUser = await User.find();
    return res.send(success(200, getUser));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Get a Single User *//

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const getaUser = await User.findById(id);
    return res.send(success(200, getaUser));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Update a User *//

const updateaUser = async (req, res) => {
  try {
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );

    return res.send(success(200, updatedUser));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Delete a User *//
const deleteaUser = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const deleteUser = await User.findByIdAndDelete(id);
    return res.send(success(200, deleteUser));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Blocked & UnBlocked Functionallity *//
const blockedUser = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    if (blockUser) {
      return res.send(success(201, "User Blocked"));
    } else {
      return res.send(success(201, "User Already Blocked"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const unBlockedUser = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const unBlockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    if (unBlockUser) {
      return res.send(success(201, "User Unblocked"));
    } else {
      return res.send(success(201, "User Already Unblocked"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Logout Functionallity *//

const logoutUser = async (req, res) => {
  try {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) {
      return res.send(error(401, "No Refresh token present in Cookies"));
    }

    const refreshToken = cookie.refreshToken;

    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        expires: new Date(0),
      });

      return res.send(error(204, "Forbidden"));
    }

    await User.findOneAndUpdate(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    });
    return res.send(success(201, "User Logout Successfully"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updatePassword = async (req, res) => {
  try {
    const { _id } = req.user;
    const { password } = req.body;
    ValidateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      return res.send(success(201, "Password is Update"));
    } else {
      return res.send(error(404, "Password is not Update"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const forgotPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send(error(404, "User Not Found"));
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `
      <div style="font-size: 24px; font-weight: bold; color: #007BFF; text-align: center; margin-bottom: 10px;">
        🌟 Forgot Password Link 🌟
      </div>
      <div style="font-size: 16px; color: #333; text-align: center;">
        Hey ${user.firstname}, here's your password reset link! Valid till 10 mintues from now
       <a href='${UNTLD_BASE_URLL_VARCEL}/reset-password/${token}'>Click
      </div>
    `;
    const data = {
      to: user.email,
      text: "Hey User",
      subject: "🌟 Password Forgot Link - Untld Store 🌟",
      html: resetURL,
    };
    sendEmails(data);
    res.send(success(201, "Link Send to your Email"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.send(error(404, "Token Expired, Please try again later"));
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.send(success(200, user));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const forgotPasswordTokenForAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send(error(404, "User Not Found"));
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `
      <div style="font-size: 24px; font-weight: bold; color: #007BFF; text-align: center; margin-bottom: 10px;">
        🌟 Forgot Password Link 🌟
      </div>
      <div style="font-size: 16px; color: #333; text-align: center;">
        Hey ${user.firstname}, here's your password reset link! Valid till 10 mintues from now
       <a href='${UNTLD_ADMIN_BASE_URLL}/reset-password/${token}'>Click
      </div>
    `;
    const data = {
      to: user.email,
      text: "Hey User",
      subject: "🌟 Password Forgot Link - Untld Admin 🌟",
      html: resetURL,
    };
    sendEmails(data);
    res.send(success(201, "Link Send to your Email"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* get wishlist controller *//
const getWishList = async (req, res) => {
  try {
    const { _id } = req.user;
    const wishList = await User.findById(_id).populate("wishList");
    return res.send(success(200, wishList));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const addToCart = async (req, res) => {
  try {
    const { color, quantity, price, productId } = req.body;
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    let newCart = await new Carts({
      userId: _id,
      productId,
      quantity,
      price,
      color,
    }).save();
    return res.send(success(200, newCart));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* get User Cart controller *//

const getaUserCart = async (req, res) => {
  try {
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    const cart = await Carts.find({ userId: _id }).populate("productId");

    if (cart) {
      return res.send(success(200, cart));
    } else {
      return res.send(error(204, "Cart is Empty"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Empty User Cart controller *//

const removeProductFromCart = async (req, res) => {
  try {
    const { _id } = req.user;
    const { cartItemId } = req.params;
    ValidateMongoDbId(_id);
    const deleteCartProduct = await Carts.deleteOne({
      userId: _id,
      _id: cartItemId,
    });
    return res.send(success(200, cartItemId));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* update quantity for User Cart  controller *//

const updateProductQuantityFromCart = async (req, res) => {
  try {
    const { _id } = req.user;
    const { cartItemId, newQuantity } = req.params;
    ValidateMongoDbId(_id);
    const cartItem = await Carts.findOne({
      userId: _id,
      _id: cartItemId,
    });

    cartItem.quantity = newQuantity;

    cartItem.save();
    return res.send(success(200, cartItem));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const createOrder = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      shippingInfo,
      paymentInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
    } = req.body;

    ValidateMongoDbId(_id);

    const order = await Order.create({
      user: _id,
      shippingInfo,
      paymentInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
    });

    const existingUser = await User.findById(_id);
    const hasExistingShippingInfo = existingUser.address.map(
      (address) => address.firstiname === shippingInfo.firstiname
    );

    if (hasExistingShippingInfo) {
      await User.findByIdAndUpdate(
        _id,
        {
          $push: { address: shippingInfo },
        },
        {
          new: true,
        }
      );
    }

    return res.send(success(200, order));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { _id } = req.user;
    const getOrder = await Order.find({ user: _id })
      .populate("user")
      .populate("orderItems.product");
    return res.send(success(200, getOrder));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getAllOrders = async (req, res) => {
  try {
    const allUsersOrders = await Order.find()
      .populate("user")
      .populate("orderItems.product");
    return res.send(success(200, allUsersOrders));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getMonthWiseOrder = async (req, res) => {
  try {
    let monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let date = new Date();
    let endDate = "";

    date.setDate(1);

    for (let i = 0; i < 12; i++) {
      date.setMonth(date.getMonth() - 1);
      endDate = monthNames[date.getMonth()] + " " + date.getFullYear();
    }
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          amount: { $sum: "$totalPriceAfterDiscount" },
          count: { $sum: 1 },
        },
      },
    ]);
    return res.send(success(200, data));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getYearlyTotalOrders = async (req, res) => {
  try {
    let monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let date = new Date();
    let endDate = "";

    date.setDate(1);

    for (let i = 0; i < 12; i++) {
      date.setMonth(date.getMonth() - 1);
      endDate = monthNames[date.getMonth()] + " " + date.getFullYear();
    }
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$totalPriceAfterDiscount" },
        },
      },
    ]);
    return res.send(success(200, data));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};


// //*Update Order By User ID  controller *//

const getOrderByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const userOrders = await Order.findOne({ _id: id })
      .populate("orderItems.product")
      .populate("user");
    return res.send(success(200, userOrders));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// //*Update Order Status User   controller *//

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    ValidateMongoDbId(id);

    const updatedOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
      },
      { new: true }
    );

    if (!updatedOrderStatus) {
      return res.send(error(404, "Order not found"));
    }
    return res.send(success(200, updatedOrderStatus));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  createUser,
  loginUser,
  adminLogin,
  saveAddress,
  getAllUser,
  getSingleUser,
  updateaUser,
  deleteaUser,
  blockedUser,
  unBlockedUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  forgotPasswordTokenForAdmin,
  getWishList,
  addToCart,
  getaUserCart,
  createOrder,
  getMyOrders,
  getMonthWiseOrder,
  getYearlyTotalOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
  removeProductFromCart,
  updateProductQuantityFromCart,
};
