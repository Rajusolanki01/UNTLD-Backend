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
  getUserCart,
  emptyUserCart,
  applyCoupon,
  createOrder,
  getAllOrders,
  getOrders,
  getOrderByUserId,
  updateOrderStatus,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

//* CREATE
router.post("/register", createUser);

//* LOGIN
router.post("/login", loginUser);

//* ADMIN LOGIN
router.post("/admin-login", adminLogin);

//* POST USER CART...

router.post("/add-to-cart", authMiddleware, addToCart);

//* POST USER CART APPLY COUPON...

router.post("/cart/applycoupon", authMiddleware, applyCoupon);

//* POST USER CREATE ORDER...

router.post("/cart/cash-order", authMiddleware, createOrder);

//* UPDATE USER PASSWORD
router.put("/update-password", authMiddleware, updatePassword);

//* FORGOT USER PASSWORD
router.post("/forgot-password-token", forgotPasswordToken);

//* RESET USER PASSWORD
router.put("/reset-password/:token", resetPassword);

//* REFRESH TOKEN
router.get("/refresh-token", refreshAccessToken);

//* GET ALL USER
router.get("/all-users", getAllUser);

//* GET A SINGLE ORDER BY USER

router.get("/get-orders", authMiddleware, getOrders);

//* GET ALL USER ORDERS

router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);

//* GET ALL ORDER BY USER ID

router.get("/getorderbyuser/:id", authMiddleware, isAdmin, getOrderByUserId);

//* Get Wishlist *//

router.get("/wishlist", authMiddleware, getWishList);

//*  LOGOUT
router.get("/logout", logoutUser);

//* GET A SINGLE USER DETAILS
router.get("/:id", authMiddleware, isAdmin, getSingleUser);

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

router.delete("/empty-cart", authMiddleware, emptyUserCart);

//* DELETE USER
router.delete("/:id", authMiddleware, deleteaUser);

module.exports = router;
