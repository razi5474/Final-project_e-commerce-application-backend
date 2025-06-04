const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userID is required']
    },
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
        quantity:{
            type: Number,
            required: [true, 'Please provide a quantity']
        },
       }],
        totalPrice:{
            type: Number,
            required:true,
            default:0
        }
    },
        {
        timestamps: true
        });

    cartSchema.methods.calculateTotalPrice = function () {
    let total = 0;
    this.Products.forEach((item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (!isNaN(price) && !isNaN(quantity)) {
      total += price * quantity;
    }
     });
  this.totalPrice = total;
};
module.exports = mongoose.model('Cart', cartSchema);