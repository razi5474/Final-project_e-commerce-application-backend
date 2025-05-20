const User = require('../models/userModel');
const Seller = require('../models/sellersModel');
const bcrypt = require('bcrypt');
const createToken = require('../utils/generateToken');

// register

const registerSeller = async (req,res,next)=>{

    try {
    // input variables stores
        const {name,email,phone,password,storeName,storeDescription} = req.body ||{} 

    // valid input
        if(!name || !email || !password || !phone || !storeName || !storeDescription){
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
            password: hashedPassword,
            phone,
            role: 'seller'
        });

        const savedUser = await newUser.save();
    // Create seller document
        const newSeller = new Seller({
            userID: savedUser._id,
            storeName,
            storeDescription
        });

        await newSeller.save();

    // remove password from response
    const userData = savedUser.toObject()
    delete userData.password

    res.status(201).json({message:"Seller account created successfully",
    userData})    

    } catch (error) {
        console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})  
    }
}

// login
const loginSeller = async (req,res,next)=>{
    try {
         // input variables stores
        const {email,password} = req.body ||{} 

    // valid input
        if(!email || !password){
            return res.status(400).json({error:"All fields are required"})
        }

    // check if user already exists
        const userExists = await User.findOne({email})
        if(!userExists || userExists.role !== 'seller'){
            return res.status(400).json({error:"seller not found or invalid role"})
        }

    // password compare
        const passwordMatch = await bcrypt.compare(password,
        userExists.password)
        
        if(!passwordMatch){
           return res.status(400).json({error:"invalid password"}) 
        }

    // token creation
        const token = createToken(userExists._id,userExists.role)
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge: 24*60*60*1000
        })
        const seller = await Seller.findOne({ userID: User._id });
        const userObject = userExists.toObject()
        delete userObject.password
        return res.status(200).json({
            message:" seller Login successful",userObject,seller})

    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
}
module.exports = {
    registerSeller,
    loginSeller
};