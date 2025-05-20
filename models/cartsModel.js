const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    Products:[{
        productID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide a productID']
        },
        price:{
            type: Number,
            required: [true, 'Please provide a price']
        },
        quanity:{
            type: Number,
            required: [true, 'Please provide a quantity']
        },
       }],
        totalPrice:{
            type: Number
        },
       craetedAt:{
       type: Date,
       default: Date.now
   },
})

module.exports = mongoose.model('Cart', cartSchema);