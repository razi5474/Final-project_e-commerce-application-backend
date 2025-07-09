const Product = require('../models/productsModel');
const Review = require('../models/reviewModel')
const Seller = require('../models/sellersModel')

// Add a review
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!productId || !rating ) {
            return res.status(400).json({ success: false, 
            error: 'Product ID and rating are required' });
        }

        // vadate user
        if(!userId) {
            return res.status(401).json({ success:false, 
            error: 'User not authenticated' });
        }

         // Convert rating to number and validate
        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
        }

        // validate product if the product exists
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({ success: false, 
            error: 'Product not found' });
        }

       

        // check only purchased users can review

        // create or update review
        const review = await Review.findOneAndUpdate(
            {userID: userId, productID: productId},
            { rating:numericRating, comment },
            { new: true, upsert: true, runValidators: true }
        );

        // update product's average rating
        const reviews = await Review.find({ productID: productId });
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        product.rating = averageRating;
        await product.save();

        return res.status(200).json({success: true,data: review})
    } catch (error) {
        console.error("Error adding review",error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productID: req.params.productId }).populate('userID', 'name');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
// Delete a review (user)
const deleteUserReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Optional: restrict delete to the author or admin
    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
};

// get average rating for a product
const getAverageRating = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ productID: productId });

    if (reviews.length === 0) {
      return res.status(200).json({ averageRating: 0 });
    }

    const average =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    res.status(200).json({ averageRating: average.toFixed(1) });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating average rating' });
  }
};

// admin
 // get all reviews 
    const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("productID userID");
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin delete any review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.productID;
    await review.deleteOne();

    // Update average rating after deletion
    const remainingReviews = await Review.find({ productID: productId });
    const average = remainingReviews.length
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0;

    const product = await Product.findById(productId);
    if (product) {
      product.rating = average;
      await product.save();
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
};

const getSellerReviews = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const { productId, page = 1, limit = 5 } = req.query;

    const sellerProducts = await Product.find({ sellerID: seller._id }).select('_id title');
    console.log("Seller User ID:", req.user.id);
    console.log("Found Seller Object:", seller);
    console.log("Products Found:", sellerProducts.length);

    const productIds = sellerProducts.map((p) => p._id.toString());

    let filter = { productID: { $in: productIds } };
    if (productId) filter.productID = productId;

    const reviews = await Review.find(filter)
      .populate('userID', 'name')
      .populate('productID', 'title')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(filter);

    // Average ratings per product
    const ratingMap = {};
    for (const p of sellerProducts) {
      const r = await Review.find({ productID: p._id });
      const avg = r.length ? (r.reduce((a, c) => a + c.rating, 0) / r.length).toFixed(1) : 0;
      ratingMap[p._id.toString()] = avg;
    }

    res.status(200).json({
      reviews,
      total,
      page: Number(page),
      limit: Number(limit),
      products: sellerProducts,
      avgRatings: ratingMap,
    });
  } catch (error) {
    console.error("Error fetching seller reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update product's average rating
    const productReviews = await Review.find({ productID: review.productID });
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    const product = await Product.findById(review.productID);
    if (product) {
      product.rating = avgRating;
      await product.save();
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
    addReview,
    getProductReviews,
    deleteUserReview,
    getAverageRating,
    getAllReviews,
    deleteReview,
    getSellerReviews,
    updateUserReview
};