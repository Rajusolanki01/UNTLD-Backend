const { success, error } = require("../middlewares/responseWrapper");
const Product = require("../models/productModel");
const slugify = require("slugify");
const ValidateMongoDbId = require("../utils/validateMongodbId");
const User = require("../models/userModel");

// * Create A Product *//
const createProduct = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    return res.send(success(201, `${newProduct.title} Product is Added`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// * Get All Product *//

const getAllProduct = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));

    //* Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //* limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //* pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount)
        return res.send(error(404, "This Page does not exists"));
    }

    const products = await query;
    return res.send(success(200, products));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// * Get A Product *//

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const findProuduct = await Product.findById(id);
    return res.send(success(200, findProuduct));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// * Update A Product *//

const updateaProduct = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updateProduct = await Product.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    if (!updateProduct) {
      return res.send(error(404, "Product not Found"));
    } else {
      return res.send(success(200, updateProduct));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// * Update A Product *//

const deleteaProduct = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const deleteProduct = await Product.findOneAndDelete({ _id: id });

    return res.send(success(201, "Product is Deleted"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Add to WishList Product *//

const addToWishList = async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;

    const user = await User.findById(_id);

    const alreadyadded = user.wishList.find(
      (id) => id.toString() === productId
    );

    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishList: productId },
        },
        {
          new: true,
        }
      );
      return res.send(success(200, user));
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishList: productId },
        },
        {
          new: true,
        }
      );

      return res.send(success(200, user.wishList));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//* Products Ratings *//

const rating = async (req, res) => {
  try {
    const { _id } = req.user;
    const { star, productId, comment } = req.body;

    const product = await Product.findById(productId);

    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(productId);
    let totalRating = getallratings.ratings.length; //* Rating Length
    let ratingsum = getallratings.ratings //* Rating Sum to Total Rating
      .map((item) => item.star) //* Extract the Star Rating Array
      .reduce((prev, curr) => prev + curr, 0); //*  With Star Array Sum All The Ratings...

    //* example of this sum/total = 13/3 => 4.3 total Rating
    let actualRating = Number((ratingsum / totalRating).toFixed(1)); //* Calculate average rating with one decimal place
    let finalproduct = await Product.findByIdAndUpdate(
      productId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );

    return res.send(success(200, finalproduct));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateaProduct,
  deleteaProduct,
  addToWishList,
  rating,
};
