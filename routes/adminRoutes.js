const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const { checkAdmin, verfySeller } = require('../controllers/adminController');
const adminRouter = express.Router();

// check if admin is authenticated
adminRouter.get('/check-admin',authAdmin,checkAdmin)

// verify seller by admin
adminRouter.put('/verify-seller/:sellerId',authAdmin,verfySeller)



module.exports = adminRouter;