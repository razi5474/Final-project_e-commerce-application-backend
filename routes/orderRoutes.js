const express = require('express');
const { createOrder, getUserOrders, getLatestAddress, getSellerOrders, updateOrderStatus, getAllOrders, adminUpdateOrderStatus, adminDeleteOrder } = require('../controllers/orderController');
const authUser = require('../middlewares/authUser');
const authSeller = require('../middlewares/authSeller');
const authAdmin = require('../middlewares/authAdmin');

const orderRouter = express.Router();
orderRouter.post('/create', authUser, createOrder);

orderRouter.get('/my-orders',authUser,getUserOrders)

orderRouter.get('/latest-address',authUser,getLatestAddress)

orderRouter.get('/seller-orders',authSeller,getSellerOrders)

orderRouter.patch('/update-status/:orderId',authSeller,updateOrderStatus)

orderRouter.get('/admin-orders',authAdmin,getAllOrders)

orderRouter.patch('/admin-update-status/:orderId',authAdmin,adminUpdateOrderStatus)

orderRouter.delete('/admin-delete/:orderId',authAdmin,adminDeleteOrder)

module.exports = orderRouter;
