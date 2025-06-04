const mongoose = require('mongoose');

const sellersSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a userID']
    },
    storeName:{
        type: String,
        required: [true, 'Please provide a store name'],
    },
    storeDescription:{
        type: String,
        required: [true, 'Please provide a store description'],
    },
    storeAddress:{
        type: String,
        required: [true, 'Please provide a store address'],
    },
    myProducts:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    isPermission:{
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('Seller', sellersSchema)