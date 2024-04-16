const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoute.js");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const ProductCategoryRouter = require("./routes/categoryRoute");
const blogcategoryRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const enquiryRouter = require("./routes/enquiryRoute");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const colors = require("colors");
const cors = require("cors");

dotenv.config();
const app = express();

const { UNTLD_BASE_URL, UNTLD_ADMIN_BASE_URL } = process.env;

//* Setup Middlewares...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("common"));
app.use(cookieParser());
const corsOptions = {
  origin: [UNTLD_BASE_URL, UNTLD_ADMIN_BASE_URL],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", ProductCategoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/color", colorRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/enquiry", enquiryRouter);

dbConnect();

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server is Running at PORT: ${PORT}`.bgCyan.black);
});
