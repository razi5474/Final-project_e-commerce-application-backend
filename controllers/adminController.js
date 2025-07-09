 const Seller = require('../models/sellersModel');
 const User =require('../models/userModel')

 // check admin autherized 
   const checkAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Not an admin.' });
    }

    res.status(200).json({
      message: 'Admin is authenticated',
      userObject: { ...admin.toObject(), role: 'admin' },
    });
  } catch (error) {
    console.error('checkAdmin error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Not an admin.' });
    }

    res.status(200).json({ 
      message: 'Admin profile fetched successfully',
      data: admin 
    });
  } catch (error) {
    console.error('getAdminProfile error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
 try {
    const userId = req.user.id;
    const { name, email, phone, password } = req.body || {};

    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json({
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};


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

   // Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle block/unblock user
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === 'admin') {
    return res.status(403).json({ error: "Cannot block an admin account." });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate('userId', '-password');
    res.status(200).json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


    
    module.exports ={
        checkAdmin,
        verfySeller,
        getAdminProfile,
        updateAdminProfile,
        getAllUsers,
        toggleBlockUser,
        getAllSellers
    }