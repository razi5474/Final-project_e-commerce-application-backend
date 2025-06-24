const express = require('express')
const { register, login, profile, logout, updateProfile, deleteUser,checkUser } = require('../controllers/userController')
const authUser = require('../middlewares/authUser')
const authAdmin = require('../middlewares/authAdmin')
const userRouter = express.Router()


// register
//  /api/user/register
userRouter.post('/register',register)

// login
//  /api/user/login
userRouter.post('/login',login)

// profile
//  /api/user/profile
userRouter.get('/profile',authUser,profile)

// profile-update
//  /api/user/update
userRouter.patch('/update',authUser,updateProfile)
// logout
//  /api/user/logout
userRouter.get('/logout',logout)

// delete-user only admin can delete user
// /api/user/delete/:userId
userRouter.delete('/delete/:userId',authAdmin,deleteUser)

// check user authentication
// /api/user/check-user
userRouter.get('/check-user',authUser,checkUser)

module.exports = userRouter
