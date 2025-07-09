const express = require('express')
const Apirouter = express.Router()

const userRouter = require('./userRoutes')
const sellerRouter = require('./sellerRoutes')
const adminRouter = require('./adminRoutes')
const productRouter = require('./productRoutes')
const categoryRouter = require('./categoryRoutes')
const cartRouter = require('./cartRoutes')
const reviewRouter = require('./reviewRoutes')
const paymentRouter = require('./paymentRoute')
const orderRouter = require('./orderRoutes')

//  /api/user
Apirouter.use('/user', userRouter)

// api/seller
Apirouter.use('/seller',sellerRouter)

// api/product
Apirouter.use('/product',productRouter)

// api/category
Apirouter.use('/category',categoryRouter)

// api/admin
Apirouter.use('/admin',adminRouter)

// api/cart
Apirouter.use('/cart',cartRouter)

// api/review
Apirouter.use('/review',reviewRouter)

// api/payment
Apirouter.use('/payment',paymentRouter)

Apirouter.use('/order',orderRouter)

module.exports = Apirouter