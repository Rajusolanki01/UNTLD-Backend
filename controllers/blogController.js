const { success, error } = require("../middlewares/responseWrapper");
const Blog = require("../models/blogModel");
const { cloudinaryUploadsImg } = require("../utils/cloudinary");
const ValidateMongoDbId = require("../utils/validateMongodbId");
const fs = require("fs");

const createBlog = async (req, res) => {
  try {
    //* Check if a blog with the same title exists
    const existingBlogWithTitle = await Blog.findOne({ title: req.body.title });
    if (existingBlogWithTitle) {
      return res.send(error(400, "Blog with the same title already exists."));
    }

    //* Check if a blog with the same description exists
    const existingBlogWithDescription = await Blog.findOne({
      description: req.body.description,
    });
    if (existingBlogWithDescription) {
      return res.send(
        error(400, "Blog with the same description already exists.")
      );
    }

    // //* Check if a blog with the same category exists
    // const existingBlogWithCategory = await Blog.findOne({
    //   category: req.body.category,
    // });
    // if (existingBlogWithCategory) {
    //   return res.send(
    //     error(400, "Blog with the same category already exists.")
    //   );
    // }

    //* If no duplicates found, create the new blog
    const newBlog = await Blog.create(req.body);
    res.send(success(201, `${newBlog.title} blog is create`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.send(success(201, `${updatedBlog.title} blog is update`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getaBlog = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const fetchBlog = await Blog.findOneAndUpdate(
      { _id: id },
      { $inc: { numViews: 1 } },
      { new: true }
    )
      .populate("likes")
      .populate("dislikes");
    if (!fetchBlog) {
      return res.send(error(404, "Blog not found."));
    }
    res.send(success(200, fetchBlog));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const fetchAllBlogs = await Blog.find();
    if (!fetchAllBlogs) {
      return res.send(error(404, "Blogs not found."));
    }
    res.send(success(200, fetchAllBlogs));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const deleteaBlog = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);
    const deleteBlog = await Blog.findByIdAndDelete(id);
    if (!deleteBlog) {
      return res.send(error(404, "Blogs not found."));
    }
    res.send(success(201, `${deleteBlog.title} is Delete`));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//TODO:
// const likeTheBlog = async (req, res) => {
//   try {
//     const { blogId } = req.body;
//     ValidateMongoDbId(blogId);

//     const blog = await Blog.findById(blogId);
//     const loginUserId = req?.user?._id;

//     const alreadyDisliked = blog?.dislikes?.find(
//       (userId) => userId?.toString() === loginUserId?.toString()
//     );

//     const alreadyLiked = blog?.likes?.find(
//       (userId) => userId?.toString() === loginUserId?.toString()
//     );

//     if (alreadyDisliked) {
//       const updatedBlog = await Blog.findByIdAndUpdate(
//         blogId,
//         {
//           $pull: { dislikes: loginUserId },
//           isDisliked: false,
//         },
//         { new: true }
//       );
//       return res.send(success(200, updatedBlog));
//     }

//     if (alreadyLiked) {
//       const updatedBlog = await Blog.findByIdAndUpdate(
//         blogId,
//         {
//           $pull: { likes: loginUserId },
//           isLiked: false,
//         },
//         { new: true }
//       );
//       return res.send(success(200, updatedBlog));
//     } else {
//       const updatedBlog = await Blog.findByIdAndUpdate(
//         blogId,
//         {
//           $push: { likes: loginUserId },
//           isLiked: true,
//           isDisliked: false, // Set isDisliked to false when liking the blog
//         },
//         { new: true }
//       );
//       return res.send(success(200, updatedBlog));
//     }
//   } catch (e) {
//     return res.send(error(500, e.message));
//   }
// };

// const dislikeTheBlog = async (req, res) => {
//   try {
//     const { blogId } = req.body;
//     ValidateMongoDbId(blogId);

//     const blog = await Blog.findById(blogId);
//     const loginUserId = req?.user?._id;

//     const alreadyLiked = blog?.likes?.find(
//       (userId) => userId?.toString() === loginUserId?.toString()
//     );

//     const alreadyDisliked = blog?.dislikes?.find(
//       (userId) => userId?.toString() === loginUserId?.toString()
//     );

//     if (alreadyLiked) {
//       const updatedBlog = await Blog.findByIdAndUpdate(
//         blogId,
//         {
//           $pull: { likes: loginUserId },
//           isLiked: false,
//         },
//         { new: true }
//       );
//       return res.send(success(200, updatedBlog));
//     }

//     if (alreadyDisliked) {
//       const updatedBlog = await Blog.findByIdAndUpdate(
//         blogId,
//         {
//           $pull: { dislikes: loginUserId },
//           isDisliked: false,
//         },
//         { new: true }
//       );
//       return res.send(success(200, updatedBlog));
//     } else {
//       const updatedBlog = await Blog.findByIdAndUpdate(
//         blogId,
//         {
//           $push: { dislikes: loginUserId },
//           isDisliked: true,
//           isLiked: false, // Set isLiked to false when disliking the blog
//         },
//         { new: true }
//       );
//       return res.send(success(200, updatedBlog));
//     }
//   } catch (e) {
//     return res.send(error(500, e.message));
//   }
// };
//TODO:

const likeTheBlog = async (req, res) => {
  try {
    const { blogId } = req.body;
    ValidateMongoDbId(blogId);

    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;

    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );

    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );

    if (alreadyDisliked) {
      //* User is toggling from dislike to like
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          $push: { likes: loginUserId },
          isLiked: true,
          isDisliked: false,
        },
        { new: true }
      );
      return res.send(success(200, updatedBlog));
    }

    if (alreadyLiked) {
      // User is un-liking the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      return res.send(success(200, updatedBlog));
    } else {
      //* User is liking the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLiked: true,
          isDisliked: false,
        },
        { new: true }
      );
      return res.send(success(200, updatedBlog));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const dislikeTheBlog = async (req, res) => {
  try {
    const { blogId } = req.body;
    ValidateMongoDbId(blogId);

    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;

    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );

    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );

    if (alreadyLiked) {
      // User is toggling from like to dislike
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          $push: { dislikes: loginUserId },
          isLiked: false,
          isDisliked: true,
        },
        { new: true }
      );
      return res.send(success(200, updatedBlog));
    }

    if (alreadyDisliked) {
      //* User is un-disliking the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      return res.send(success(200, updatedBlog));
    } else {
      //* User is disliking the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislikes: loginUserId },
          isDisliked: true,
          isLiked: false,
        },
        { new: true }
      );
      return res.send(success(200, updatedBlog));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    ValidateMongoDbId(id);

    const uploader = (path) => cloudinaryUploadsImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      try {
        fs.unlinkSync(path);
      } catch (error) {}
    }

    const findblog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );
    return res.send(success(200, findblog));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  createBlog,
  updateBlog,
  getaBlog,
  getAllBlogs,
  deleteaBlog,
  likeTheBlog,
  dislikeTheBlog,
  uploadImages,
};
