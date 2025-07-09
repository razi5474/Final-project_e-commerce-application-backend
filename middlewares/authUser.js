const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const authUser = async (req,res,next)=>{

    try {
        // collect token from cookies
        const{token} = req.cookies;
        // console.log("Incoming Cookies:", req.cookies);

        // no token- unauthorized user
        if(!token){
            return res.status(401).json({message:"Unauthorized user"})
        }
        // token decode
        const decodedToken=jwt.verify(token,process.env.JWT_SECRET_KEY)

        // issue with token
        if(!decodedToken){
             return res.status(401).json({message:"invalid token"})
        }
         if (decodedToken.role !== 'user') {
            return res.status(403).json({ message: "Forbidden: not a user" });
        }
            const user = await User.findById(decodedToken.id);
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        if (user.isBlocked) {
        return res.status(403).json({ message: "Access denied. You are blocked by admin." });
        }
        
        // attach token to req
        req.user=decodedToken
        // next
        next()
    } catch (error) {
          console.error('Auth error:', error);
          res.status(401).json({ message: 'Authentication failed' });
    }
}

module.exports = authUser