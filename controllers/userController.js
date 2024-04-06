const {
  generateJwtToken,
  generateJwtRefreshToken,
} = require("../config/jwttoken");
const { error, success } = require("../middlewares/responseWrapper");
const User = require("../models/userModel");
const ValidateMongoDbId = require("../utils/validateMongoDbId");
const jwt = require("jsonwebtoken");
const sendEmails = require("./emailController");
const crypto = require("crypto");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Carts = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const uniqid = require("uniqid");

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
      return res.send(success(200, { accessToken }));
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
    if (updatedUser) {
      return res.send(success(200, updatedUser));
    } else {
      return res.send(success(201, "User Already Updated"));
    }
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
    if (deleteUser) {
      res.json({
        deleteUser,
      });
    } else {
      return res.send(success(201, "User Already Deleted"));
    }
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
       <a href='http://localhost:3000/reset-password/${token}'>Click
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
    res.send(success(201, "Your Password is Reset"));
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

//* Add to User Cart controller *//

// const addToCart = async (req, res) => {
//   try {
//     const { cart } = req.body;
//     const { _id } = req.user;
//     ValidateMongoDbId(_id);

//     let products = [];
//     const user = await User.findById(_id);

//     //* check if user already has a cart
//     const alreadyExistCart = await Cart.findOne({ orderby: user._id });
//     if (alreadyExistCart) {
//       await Cart.deleteOne({ _id: alreadyExistCart._id });
//     }

//     for (let i = 0; i < cart.length; i++) {
//       let object = {};
//       object.product = cart[i]._id;
//       object.count = cart[i].count;
//       object.color = cart[i].color;

//       //* Find the product by ID
//       const getProduct = await Product.findById(cart[i]._id);

//       //* Check if the product is found
//       if (!getProduct) {
//         return res.send(
//           error(404, `Product with ID ${cart[i].product} not found`)
//         );
//       }

//       //* Access the 'price' property if the product is found
//       object.price = getProduct.price;
//       products.push(object);

//       //* Remove the product from wishlist if it exists
//       user.wishList.pull(cart[i]._id);
//     }

//     let cartTotal = 0;
//     for (let i = 0; i < products.length; i++) {
//       cartTotal = cartTotal + products[i].price * products[i].count;
//     }

//     let newCart = await Cart.create({
//       products,
//       cartTotal,
//       orderby: user?._id,
//     });

//     await newCart.save();

//     let updateUser = await User.findByIdAndUpdate(
//       _id,
//       {
//         $push: { cart: newCart },
//       },
//       {
//         new: true,
//       }
//     );
//     return res.send(success(201, "Product is Add To Cart"));
//   } catch (e) {
//     return res.send(error(500, e.message));
//   }
// };

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price, color } = req.body;
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    let newCart = await new Cart({
      userId: _id,
      productId,
      quantity,
      price,
      color,
    }).save();

    // let updateUser = await User.findByIdAndUpdate(
    //   _id,
    //   {
    //     $push: { cart: newCart },
    //   },
    //   {
    //     new: true,
    //   }
    // );
    return res.send(success(201, newCart));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* get User Cart controller *//

const getaUserCart = async (req, res) => {
  try {
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.productId"
    );

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

const emptyUserCart = async (req, res) => {
  try {
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    const user = await User.findById(_id);
    const cart = await Cart.findOneAndDelete({ orderby: user._id });
    return res.send(success(204, "Cart Items is Deleted"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//*Apply Coupon User Cart controller *//

const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    const validCoupon = await Coupon.findOne({ name: coupon });

    console.log(validCoupon);

    if (validCoupon === null) {
      res.send(error(403, "Invalid Coupon"));
    }

    const user = await User.findById({ _id });

    let { cartTotal } = await Cart.findOne({
      orderby: user._id,
    }).populate("products.product");

    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);

    await Cart.findOneAndUpdate(
      { orderby: user._id },
      { totalAfterDiscount },
      { new: true }
    );
    return res.send(
      success(201, `Your Total Disocunt is ${totalAfterDiscount}`)
    );
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

//*Create Order User controller *//

const createOrder = async (req, res) => {
  try {
    const { COD, CouponApplied } = req.body;
    const { _id } = req.user;
    ValidateMongoDbId(_id);

    if (!COD) return res.send(error(403, "Create cash order failed"));

    const user = await User.findById({ _id });

    const userCart = await Cart.findOne({ orderby: user._id });

    let finalAmout = 0;

    if (CouponApplied === true && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "INR",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    }).save();

    let update = await userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    const updated = await Product.bulkWrite(update, {});

    return res.send(success(201, "Success"));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

//*Get All Orders User controller *//

const getOrders = async (req, res) => {
  try {
    const { _id } = req.user;
    console.log(id);
    ValidateMongoDbId(id);

    const userOrders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    return res.send(success(200, userOrders));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getAllOrders = async (req, res) => {
  try {
    const allUsersOrders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    return res.send(success(200, allUsersOrders));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//*Update Order By User ID  controller *//

const getOrderByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const userOrders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    return res.send(success(200, userOrders));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//*Update Order Status User   controller *//

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    ValidateMongoDbId(id);

    const updatedOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
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
  getWishList,
  addToCart,
  getaUserCart,
  emptyUserCart,
  applyCoupon,
  createOrder,
  updateOrderStatus,
  getOrders,
  getAllOrders,
  getOrderByUserId,
};
