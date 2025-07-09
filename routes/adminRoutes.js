const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const { checkAdmin, verfySeller, getAdminProfile, updateAdminProfile, getAllUsers, toggleBlockUser, getAllSellers } = require('../controllers/adminController');
const adminRouter = express.Router();

// check if admin is authenticated
adminRouter.get('/check-admin',authAdmin,checkAdmin)

// get admin profile
adminRouter.get('/profile',authAdmin,getAdminProfile)

// update admin profile
adminRouter.patch('/update-profile',authAdmin,updateAdminProfile)

// verify seller by admin
adminRouter.put('/verify-seller/:sellerId',authAdmin,verfySeller)

// get all users
adminRouter.get('/all-users',authAdmin,getAllUsers)

// get all sellers
adminRouter.get('/all-sellers',authAdmin,getAllSellers)

// block user
adminRouter.patch('/block-user/:userId',authAdmin,toggleBlockUser)


module.exports = adminRouter;