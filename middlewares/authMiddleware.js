const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { error } = require("./responseWrapper");

const authMiddleware = async (req, res, next) => {
  let accessToken;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    accessToken = req.headers.authorization.split(" ")[1];

    try {
      if (accessToken) {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECERT_TOKEN);

        const user = await User.findById(decoded._id);

        if (user) {
          req.user = user;
          next();
        } else {
          return res.send(error(404, "User Not Found"));
        }
      }
    } catch (e) {
      return res.send(error(401, "Invalid access key please login again"));
    }
  } else {
    return res.send(error(404, "Please Login to Untld."));
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const { email } = req.user;

    const adminUser = await User.findOne({ email });

    if (adminUser.role !== "admin") {
      res.status(403).json({ message: "Permission denied not an Admin" });
    } else {
      next();
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  authMiddleware,
  isAdmin,
};
