const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const createToken = require('../utils/generateToken')

// register

const register = async (req,res,next)=>{

    try {
    // input variables stores
        const {name,email,password,phone,role} = req.body ||{} 

    // valid input
        if(!name || !email || !password || !phone){
            return res.status(400).json({error:"All fields are required"})
        }

    // check if user already exists
        const userExists = await User.findOne({email})
        if(userExists){
            return res.status(400).json({error:"User already exists"})
        }
    // password hashing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        
    // user saving to db
    const newUser = new User({
        name,
        email,
        password:hashedPassword,
        phone,
        role
    })

    const savedUser = await newUser.save()

    // remove password from response
    const userData = savedUser.toObject()
    delete userData.password

    res.status(201).json({message:"Account created successfully",
    userData})    

    } catch (error) {
        console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})  
    }
}

// login
const login = async (req,res,next)=>{
    try {
         // input variables stores
        const {email,password} = req.body ||{} 

    // valid input
        if(!email || !password){
            return res.status(400).json({error:"All fields are required"})
        }

    // check if user already exists
        const userExists = await User.findOne({email})
        if(!userExists){
            return res.status(400).json({error:"User not found"})
        }
     // ✅ Blocked check
        if (userExists.isBlocked) {
            return res.status(403).json({ error: "Your account is blocked. Please contact support." });
        }
    // password compare
        const passwordMatch = await bcrypt.compare(password,
        userExists.password)
        
        if(!passwordMatch){
           return res.status(400).json({error:"invalid password"}) 
        }

   

    // token creation
        const token = createToken(userExists._id,userExists.role)
        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // ✅ false in dev
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000,
        });
        

        const userObject = userExists.toObject()
        delete userObject.password
        return res.status(200).json({
            message:"Login successful",userObject})

    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
}

// profile
const profile = async (req,res,next)=>{
    try {
        const userId = req.user.id

        const userData = await User.findById(userId).select("-password")
        return res.status(200).json({data:userData,
            message:"profile retrieved successfully"})

    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
}

// profile-update
const updateProfile = async (req,res,next)=>{
    try {
        const userId = req.user.id

        const {name,email,phone,password} = req.body ||{}
        const userData = await User.findByIdAndUpdate(userId,
        {name,email,phone,password},{new:true}).select("-password")
        return res.status(200).json({data:userData,
            message:"profile updated successfully"})
        // in password section there will be some changes in future like forgot password and reset password 
    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
}
// logout
const logout = async (req,res,next)=>{
    const isProduction = process.env.NODE_ENV === 'PRODUCTION';
    try {
        res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        });
        res.status(200).json({
            success:true,
            message:"Logout successful"
        })
    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})  
    }
}
// delete user (only admin can delete user)
const deleteUser = async (req,res,next)=>{
    try {
        const userId = req.params.userId
        if(!userId){
            return res.status(400).json({error:"User id is required"})
        }

        const userData = await User.findByIdAndDelete(userId)
        if(!userData){
            return res.status(400).json({error:"User not found"})
        }

        return res.status(200).json({deletedUser:userData._id,
            message:"user deleted successfully"})
        // in password section there will be some changes in future like forgot password and reset password 
    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
}
const checkUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        const userObj = user.toObject();
        res.json({ message: "User is authenticated", userObject: userObj });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
}


module.exports={register,login,profile,logout,updateProfile,deleteUser,checkUser}