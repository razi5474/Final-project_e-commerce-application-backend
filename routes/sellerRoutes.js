const express = require('express')
const {registerSeller,loginSeller, logout, sellerProfile, updateProfile, deleteseller, checkSeller,} = require('../controllers/sellerController')
const authSeller = require('../middlewares/authSeller')
const authAdmin = require('../middlewares/authAdmin')
const sellerRouter = express.Router()

// register
//  /api/seller/register
sellerRouter.post('/register',registerSeller)

// login
//  /api/seller/login
sellerRouter.post('/login',loginSeller)

// profile
//  /api/seller/profile
sellerRouter.get('/profile',authSeller,sellerProfile)

// update profile
//  /api/seller/update
sellerRouter.patch('/update',authSeller,updateProfile)

// logout
//  /api/seller/logout
sellerRouter.get('/logout',logout)

// delete-seller only admin can delete seller
// /api/seller/delete/:sellerId
sellerRouter.delete('/delete/:sellerId',authAdmin,deleteseller)

// check seller authentication
// /api/seller/check-seller
sellerRouter.get('check-seller',authSeller,checkSeller)




module.exports = sellerRouter