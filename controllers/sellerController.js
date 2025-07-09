const User = require('../models/userModel');
const Seller = require('../models/sellersModel');
const bcrypt = require('bcrypt');
const createToken = require('../utils/generateToken');

// register

const registerSeller = async (req,res,next)=>{

    try {
    // input variables stores
        const {name,email,phone,password,storeName,storeDescription,storeAddress} = req.body ||{} 

    // valid input
        if(!name || !email || !password || !phone || !storeName || !storeDescription || !storeAddress){
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
            userId: savedUser._id,
            storeName,
            storeDescription,
            storeAddress
        });

       const savedSeller = await newSeller.save();

    // remove password from response
    const userData = savedUser.toObject()
    delete userData.password

    res.status(201).json({message:"Seller account created successfully",
    userData:userData,sellerData:savedSeller})    

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
    // ✅ Check if blocked
    if (userExists.isBlocked) {
      return res.status(403).json({ error: "Your account is blocked by admin" });
    }
    // password compare
        const passwordMatch = await bcrypt.compare(password,
        userExists.password)
        
        if(!passwordMatch){
           return res.status(400).json({error:"invalid password"}) 
        }

    // permission check
    const verfySeller = await Seller.findOne({ userId: userExists._id });

    if (!verfySeller || !verfySeller.isPermission) {
    return res.status(403).json({ error: 'Seller is not yet approved by admin' });
    }

    // token creation
        const token = createToken(userExists._id,'seller')

        const isProduction = process.env.NODE_ENV === 'production';

       res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction, // true in production (Render uses HTTPS)
        sameSite: isProduction ? 'None' : 'Lax', // 'None' needed for cross-origin cookie
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        const seller = await Seller.findOne({ userId: userExists._id });    
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

// profile retrieval
    const sellerProfile = async (req,res,next)=>{
        try {
            const userId = req.user.id
    
            const userData = await User.findById(userId).select("-password");
            const sellerData = await Seller.findOne({ userId: userId });

             if (!userData || !sellerData) {
            return res.status(404).json({ error: "Seller profile not found" });
        }

            return res.status(200).json({user:userData,seller:sellerData,
                message:"seller profile retrieved successfully"})
    
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
    
            const {name,email,phone,password,storeName,storeDescription,storeAddress} = req.body ||{}

            const updatedUserFields = { name, email, phone };
            if (password?.trim()) {
            const salt = await bcrypt.genSalt(10);
            updatedUserFields.password = await bcrypt.hash(password, salt);
        }

            // update user details
            const updateUser = await User.findByIdAndUpdate(userId,
            updatedUserFields,{new:true}).select("-password")

            // update seller details
            const updateSeller = await Seller.findOneAndUpdate(
                {userId},{storeName,storeDescription,storeAddress},{new:true}
            )
            return res.status(200).json({
                message:"seller profile updated successfully",
                user:updateUser,seller:updateSeller})
        
        } catch (error) {
           console.log(error)
            res.status(error.status||500).json({error:error.message || 
            'Internal Server Error'})   
        }
    }

// seller logout
    const logout = async (req,res,next)=>{
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        });
        res.status(200).json({
            success:true,
            message:"seller Logout successful"
        })
    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})  
    }
}
// delete seller (only admin can delete seller)
    const deleteseller = async (req,res,next)=>{
     try {
        const sellerId = req.params.sellerId
        if(!sellerId){
            return res.status(400).json({error:"Seller id is required"})
        }

        const sellerData = await Seller.findByIdAndDelete(sellerId)
        if(!sellerData){
            return res.status(400).json({error:"Seller not found"})
        }

        const userData =await User.findByIdAndDelete(sellerData.userId);


        return res.status(200).json({deletedSeller:sellerData._id,
            deletedUser: userData ? userData._id : null,
            message:"seller deleted successfully both Seller and User collections"})
        // in password section there will be some changes in future like forgot password and reset password 
     } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
    }   

    // check user autherized
    const checkSeller = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        const userObj = user.toObject();
        userObj.role = 'seller'; // Ensure role is set
        res.json({ message: "Seller is authenticated", userObject: userObj });
    } catch (error) {
        res.status(error.status||500).json({error:error.message || 'Internal Server Error'}) 
    }
    }
    

module.exports = {
    registerSeller,
    loginSeller,
    logout,
    sellerProfile,
    updateProfile,
    deleteseller,
    checkSeller
};