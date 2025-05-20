const jwt = require('jsonwebtoken')
const authUser = (req,res,next)=>{

    try {
        // collect token from cookies
        const{token} = req.cookies

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