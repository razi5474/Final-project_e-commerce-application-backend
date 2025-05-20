const express = require('express')
const {registerSeller,loginSeller} = require('../controllers/sellerController')
const sellerRouter = express.Router()

// register
//  /api/seller/register
sellerRouter.post('/register',registerSeller)

// login
//  /api/seller/login
sellerRouter.post('/login',loginSeller)



module.exports = sellerRouter