const Order = require('../models/ordersModel');
const Cart = require('../models/cartsModel');
const Product= require('../models/productsModel')

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullName,
      phone,
      address,
      city,
      state,
      postalCode,
      country = 'India',
      products,
    } = req.body;

    // Validate address
    if (!fullName || !phone || !address || !city || !state || !postalCode) {
      return res.status(400).json({ error: 'Incomplete shipping address' });
    }

    // Validate products
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products in order' });
    }

    // ✅ Fetch product data from DB
    const productIds = products.map(item => item.productID);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).populate('sellerID');

    // ✅ Inject sellerID into each product
    const productsWithSellerID = products.map(item => {
    const matchedProduct = dbProducts.find(
      (p) => p._id.toString() === (item.productID._id?.toString() || item.productID.toString())
    );

    if (!matchedProduct) {
      throw new Error(`Product not found in DB for ID: ${item.productID}`);
    }
    const sellerID = matchedProduct.sellerID ? matchedProduct.sellerID : 'admin';

    return {
      productID: matchedProduct._id,
      quantity: item.quantity,
      price: item.price,
      sellerID
    };
  });



    // Calculate total price
    const totalPrice = products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create new order
    const newOrder = await Order.create({
      user: userId,
      products:productsWithSellerID,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
      },
      totalPrice,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    // Optional: Clear cart if exists
    await Cart.findOneAndDelete({ userId: userId });

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
    .populate('products.productID');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
// GET /api/order/latest-address
const getLatestAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const latestOrder = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .select('shippingAddress');

    if (!latestOrder) {
      return res.status(404).json({ error: 'No address found' });
    }

    res.status(200).json({ address: latestOrder.shippingAddress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch address' });
  }
};

// GET /api/order/seller-orders
const getSellerOrders = async (req, res) => {
  const { page = 1, limit = 5, orderStatus, paymentStatus } = req.query;
  const sellerId = req.user.id;

  const query = {
    'products.sellerID': sellerId,
  };

  if (orderStatus) query.orderStatus = orderStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const orders = await Order.find(query)
    .populate('products.productID')
    .populate('user', 'name email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
  
};


const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validTransitions = {
      processing: ['shipped'],
      shipped: ['delivered'],
      delivered: [], // can't go further
    };

    const currentStatus = order.orderStatus;
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from "${currentStatus}" to "${status}"`,
      });
    }

    order.orderStatus = status;

    if (status === 'delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      updatedOrder: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.productID')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
// PATCH /api/order/admin-update-status/:orderId
const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.orderStatus = status;

    if (status === 'delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/order/admin-delete/:orderId
const adminDeleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





module.exports = { createOrder,getUserOrders,getLatestAddress,getSellerOrders,updateOrderStatus,getAllOrders,adminUpdateOrderStatus,adminDeleteOrder };
