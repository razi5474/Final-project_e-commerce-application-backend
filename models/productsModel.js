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
        required: [true, 'Please provide product a description']
    },
    image:{
        type: String,
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
    catagoryID:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Catagory',
        required: [true, 'Please provide product a catagoryID']
    },
    sellerID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    reviewsID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviews'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }

      
    })

    module.exports = mongoose.model('Product', productsSchema)
    
