const mongoose = require('mongoose');

const catagorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
    },
    description: {
        type: String,
    },
    productID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required:true
    }
})