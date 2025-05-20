const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    Products:[{
        productID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        price:Number,
        quantity:{
            type: Number,
            default: 1
        },
        totalAmount: Number,
        shippingAddress: String,
        paymentMethod: String,
        status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
        purchaseDate: { type: Date, default: Date.now }
    }]
})

module.exports = mongoose.model('Cart', cartSchema)