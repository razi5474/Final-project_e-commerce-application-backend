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
        required: [true, 'Please provide a rating']
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Review', ReviewSchema);