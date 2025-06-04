 const Seller = require('../models/sellersModel');

 // check admin autherized 
    const checkAdmin =async (req, res, next) => {
        try {
            res.json({message: "Admin is authenticated",loggedinUser:req.user.id });
        } catch (error) {
            res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'}) 
        }
    } 



// admin verfying seller
    const verfySeller = async (req,res,next)=>{
        try {
            const { sellerId } = req.params;

            // Check admin access
          if (req.user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Only admin can verify sellers' });
          }

          // Check if seller exists
             const seller = await Seller.findById(sellerId);
             if (!seller) {
            return res.status(404).json({ success: false, error: 'Seller not found' });
          }

           // Check if already verified
             if (seller.isPermission) {
             return res.status(400).json({ success: false, message: 'Seller is already verified' });
            }

          // Update isPermission to true
             seller.isPermission = true;
             await seller.save();

             res.status(200).json({
             success: true,
             message: 'Seller has been verified successfully',
             seller,
         });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    }

   


    
    module.exports ={
        checkAdmin,
        verfySeller
    }