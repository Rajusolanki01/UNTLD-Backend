const express = require("express");
const {
  createUser,
  loginUser,
  getAllUser,
  getSingleUser,
  deleteaUser,
  updateaUser,
  blockedUser,
  unBlockedUser,
  refreshAccessToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  adminLogin,
  getWishList,
  saveAddress,
  addToCart,
  createOrder,
  getAllOrders,
  getOrderByUserId,
  updateOrderStatus,
  getaUserCart,
  removeProductFromCart,
  updateProductQuantityFromCart,
  getMyOrders,
  getMonthWiseOrder,
  getYearlyTotalOrders,
  forgotPasswordTokenForAdmin,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  checkout,
  paymentVerifiction,
} = require("../controllers/paymentController");
const router = express.Router();

//* CREATE
router.post("/register", createUser);

//* LOGIN
router.post("/login", loginUser);

//* ADMIN LOGIN
router.post("/admin-login", adminLogin);

//* POST USER CART...

router.post("/add-to-cart", authMiddleware, addToCart);

//* UPDATE PRODUCT QUANITTY IN CART....
router.put(
  "/update-product-cart/:cartItemId/:newQuantity",
  authMiddleware,
  updateProductQuantityFromCart
);

//* REMOVE ITEM FROM CART.....

router.delete(
  "/remove-product-cart/:cartItemId",
  authMiddleware,
  removeProductFromCart
);


//* POST USER CREATE ORDER...

router.post("/cart/create-order", authMiddleware, createOrder);

router.get("/cart/getmyOrders", authMiddleware, getMyOrders);

//* RAZORPYA CHECKOUT  ORDER...

router.post("/order/checkout", authMiddleware, checkout);

//* RAZORPAY PAYMENTID ORDERID ORDER...

router.post("/order/paymentVerifiction", authMiddleware, paymentVerifiction);

//*GET MONTHWISE ORDERS...

router.get("/order/getMonthWiseOrderIncome", authMiddleware, getMonthWiseOrder);

//*GET YEARLY TOTAL ORDERS COUNT...

router.get("/order/getYearTotalOrders", authMiddleware, getYearlyTotalOrders);

//* UPDATE USER PASSWORD
router.put("/update-password", authMiddleware, updatePassword);

//* FORGOT USER PASSWORD
router.post("/forgot-password-token", forgotPasswordToken);

//* FORGOT USER PASSWORD FOR ADMIN
router.post("/admin/forgot-password-token", forgotPasswordTokenForAdmin);

//* RESET USER PASSWORD
router.put("/reset-password/:token", resetPassword);

//* REFRESH TOKEN
router.get("/refresh-token", refreshAccessToken);

//* GET ALL USER
router.get("/all-users", getAllUser);

//* GET ALL USER ORDERS

router.get("/order/getallorders", authMiddleware, isAdmin, getAllOrders);

//* GET ALL ORDER BY USER ID

router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getOrderByUserId);

//* Get Wishlist *//

router.get("/wishlist", authMiddleware, getWishList);

//* Get User Cart *//
router.get("/usercart", authMiddleware, getaUserCart);

//*  LOGOUT
router.get("/logout", logoutUser);

//* GET A SINGLE USER DETAILS
router.get("/:id", authMiddleware, getSingleUser);

//* UPDATE USER
router.put("/edit-user", authMiddleware, updateaUser);

//* SAVE USER ADDRESS
router.put("/save-address", authMiddleware, saveAddress);

//* BLOCKED USER
router.put("/block-user/:id", authMiddleware, isAdmin, blockedUser);

//* UNBLOCKED USER
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockedUser);

//* UPDATE USER ORDER STATUS
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

//* USER CART EMPTY *//

//* DELETE USER
router.delete("/delete/:id", authMiddleware, deleteaUser);

module.exports = router;
