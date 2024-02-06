const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully".bgWhite.black);
  } catch (error) {
    console.log("Database error".bgRed.white);
  }
};
module.exports = dbConnect;
