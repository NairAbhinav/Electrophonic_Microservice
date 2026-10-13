import Order from '../models/Order.js';
import { sendOrderEmail } from '../config/mail.js';
import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5005';

// Helper to simulate populate('userId', 'name email')
const populateOrderUsers = async (orders) => {
  if (!orders || orders.length === 0) return orders;

  // Extract unique userIds
  const userIds = [...new Set(orders.map(o => o.userId.toString()))];

  try {
    const userRes = await axios.post(`${USER_SERVICE_URL}/api/users/batch`, { userIds });
    const usersList = userRes.data.users || [];

    const userMap = {};
    usersList.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    return orders.map(order => {
      const orderObj = order.toObject ? order.toObject() : order;
      const userDetails = userMap[order.userId.toString()];
      orderObj.userId = userDetails || { _id: order.userId, name: 'User Not Found', email: 'unknown@mail.com' };
      return orderObj;
    });
  } catch (error) {
    console.error('Failed to populate user details in orders:', error.message);
    return orders.map(o => o.toObject ? o.toObject() : o);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req, res) => {
  const { products, shippingAddress, paymentMethod, paymentId, totalAmount } = req.body;

  try {
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }

    // 1. Validate stock availability and decrement stock in Product Service
    try {
      await axios.post(`${PRODUCT_SERVICE_URL}/api/products/validate-and-decrement-stock`, { items: products });
    } catch (err) {
      const status = err.response?.status || 400;
      const message = err.response?.data?.message || 'Stock verification/decrement failed';
      return res.status(status).json({ message });
    }

    // 2. Create the order
    const order = new Order({
      userId: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      paymentId,
      totalAmount
    });

    const createdOrder = await order.save();

    // 3. Clear User Cart in Cart Service
    try {
      await axios.delete(`${CART_SERVICE_URL}/api/cart/internal/clear/${req.user._id}`);
    } catch (err) {
      console.error('Failed to clear user cart in checkout:', err.message);
    }

    // 4. Send confirmation email
    try {
      await sendOrderEmail(createdOrder, req.user);
    } catch (err) {
      console.error('Failed to send confirmation email:', err.message);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders or seller/admin orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin sees all orders
      const orders = await Order.find({}).sort({ createdAt: -1 });
      const populated = await populateOrderUsers(orders);
      return res.json(populated);
    } else if (req.user.role === 'seller') {
      // Seller sees orders that contain their products
      let sellerProducts = [];
      try {
        const prodRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/seller/${req.user._id}`);
        sellerProducts = prodRes.data || [];
      } catch (err) {
        console.error('Failed to retrieve seller products:', err.message);
      }

      const productIds = sellerProducts.map(p => p._id.toString());
      
      const allOrders = await Order.find({}).sort({ createdAt: -1 });
      const populatedOrders = await populateOrderUsers(allOrders);
      
      // Filter orders that contain seller's products
      const sellerOrders = populatedOrders.filter(order => 
        order.products.some(item => productIds.includes(item.productId.toString()))
      );

      return res.json(sellerOrders);
    } else {
      // Customer sees their own orders
      const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Seller/Admin)
export const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = orderStatus || order.orderStatus;
      order.paymentStatus = paymentStatus || order.paymentStatus;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= INTERNAL ENDPOINTS =================

export const getOrderStats = async (req, res) => {
  try {
    const allOrders = await Order.find({});
    const totalOrders = allOrders.length;

    // Calculate revenue
    let revenue = 0;
    allOrders.forEach(o => {
      if (o.paymentStatus === 'Paid' || o.paymentMethod === 'COD') {
        revenue += o.totalAmount;
      }
    });

    // Monthly sales aggregation
    const monthlySales = await Order.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: 'Paid' },
            { paymentMethod: 'COD' }
          ]
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = monthlySales.map(item => ({
      month: monthNames[item._id - 1] || `Month ${item._id}`,
      sales: item.sales,
      count: item.count
    }));

    // Top selling products
    const productSalesMap = {};
    allOrders.forEach(order => {
      order.products.forEach(item => {
        const prodId = item.productId.toString();
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            name: item.name,
            sales: 0,
            quantity: 0
          };
        }
        productSalesMap[prodId].sales += item.price * item.quantity;
        productSalesMap[prodId].quantity += item.quantity;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      totalOrders,
      revenue,
      monthlySales: formattedMonthlySales,
      topSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
