const express = require('express')
const Apirouter = express.Router()

const userRouter = require('./userRoutes')
const sellerRouter = require('./sellerRoutes')

//  /api/user
Apirouter.use('/user', userRouter)

// api/seller
Apirouter.use('/seller',sellerRouter)


module.exports = Apirouter