const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    rating:{
        type: Number,
        required: [true, 'Please provide a rating'],
        min:[1, 'Rating must be at least 1'],
        max:[5, 'Rating cannot exceed 5']
    },
    comment:{
        type: String,
        required:[true,'comment is required'],
        trim: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Review', ReviewSchema);