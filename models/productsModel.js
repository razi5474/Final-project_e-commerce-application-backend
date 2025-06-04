const mongoose = require('mongoose')
const { rawListeners, create } = require('./userModel')

const productsSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'Please provide product a title']
    },
    price:{
        type:Number,
        required: [true, 'Please provide product a price']
    },
    description:{
        type: String,
        required: [true, 'Please provide product a description'],
        minlength: [20, 'Description must be at least 20 characters long'],
        maxlength: [500, 'Description must be at most 500 characters long']
    },
    images:{
        type: [String],
        required: [true, 'Please provide product a image']
    },
    rating:{
        type: Number,
        required: [true, 'Please provide product a rating']
    },
    stock:{
        type: Number,
        required: [true, 'Please provide product a stock'],
        min:0
    },
    colors:{
        type: [String],
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please provide product a catagoryID']
    },
    sellerID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    reviewsID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviews'
    }
    },{
    timestamps: true,
    } )

    module.exports = mongoose.model('Product', productsSchema)
    
