const express = require('express')
const authUser = require('../middlewares/authUser')
const authAdmin = require('../middlewares/authAdmin')
const { addProducttoCart, removeProductFromCart, getCart, clearCart, updateProductInCart, deleteUserCart } = require('../controllers/cartControllers')

const cartRouter = express.Router()

// add to cart
cartRouter.post('/addProduct',authUser,addProducttoCart)
// remove product from cart
cartRouter.delete('/removeProduct',authUser,removeProductFromCart)
// clear cart
cartRouter.delete('/clearCart',authUser,clearCart)
// get cart deatails
cartRouter.get('/',authUser,getCart)
// update product quantity in cart
cartRouter.put('/updateCart',authUser,updateProductInCart)
// delete user cart by admin
cartRouter.delete('/delete/:userId',authAdmin,deleteUserCart)


module.exports = cartRouter
