const express = require('express');

const authUser = require("../middlewares/authUser");
const { addReview, getProductReviews, deleteReview, getAverageRating, getAllReviews, deleteUserReview, getSellerReviews, updateUserReview } = require('../controllers/reviewController');
const authAdmin = require('../middlewares/authAdmin');
const authSeller = require('../middlewares/authSeller')
const reviewRouter = express.Router();
// add review
reviewRouter.post('/add',authUser,addReview)
// delete
reviewRouter.delete('/delete/:reviewId',authUser,deleteUserReview)
// get rewiews by product id
reviewRouter.get('/product/:productId',getProductReviews)
// get average
reviewRouter.get('/average/:productId',getAverageRating)
// get all reviews by admin
reviewRouter.get('/admin/all',authAdmin,getAllReviews)
// delete review by admin
reviewRouter.delete('/admin/delete/:reviewId',authAdmin,deleteReview)
// get reviews for seller 
reviewRouter.get('/seller',authSeller,getSellerReviews)
// update user review
reviewRouter.put('/update/:reviewId',authUser,updateUserReview)

module.exports = reviewRouter;