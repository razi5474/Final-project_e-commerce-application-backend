const mongoose = require('mongoose');

const sellersSchema = new mongoose.Schema({
    userID:{
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
    totalOrders:{
        type: Number,
        default: 0
    },
    myProducts:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product'
    },
    totalRevenue:{
        type: Number,
        default: 0
    },
    soldProducts:{
        type: Number,
        default: 0
    },
    craetedAt:{
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Seller', sellersSchema)