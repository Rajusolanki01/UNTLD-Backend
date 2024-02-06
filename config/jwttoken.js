const jwt = require("jsonwebtoken");

const generateJwtToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECERT_TOKEN, { expiresIn: "1d" });
};

const generateJwtRefreshToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECERT_TOKEN, {
    expiresIn: "3d",
  });
};

module.exports = { generateJwtToken, generateJwtRefreshToken };
