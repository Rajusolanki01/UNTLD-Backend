const jwt = require("jsonwebtoken");

const generateJwtToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECERT_TOKEN, { expiresIn: "2d" });
};

const generateJwtRefreshToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECERT_TOKEN, {
    expiresIn: "1y",
  });
};

module.exports = { generateJwtToken, generateJwtRefreshToken };
