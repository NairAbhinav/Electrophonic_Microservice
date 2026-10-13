import User from '../models/User.js';
import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5006';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5005';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details by admin
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        profileImage: user.profileImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      if (req.body.profileImage) {
        user.profileImage = req.body.profileImage;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        profileImage: updatedUser.profileImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for admin dashboard
// @route   GET /api/users/analytics/dashboard
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});

    // Fetch product stats
    let totalProducts = 0;
    let categoryStats = [];
    try {
      const prodRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/internal/stats`);
      totalProducts = prodRes.data.totalProducts;
      categoryStats = prodRes.data.categoryStats;
    } catch (err) {
      console.error('Failed to fetch product stats:', err.message);
    }

    // Fetch order stats
    let totalOrders = 0;
    let revenue = 0;
    let monthlySales = [];
    let topSellingProducts = [];
    try {
      const orderRes = await axios.get(`${ORDER_SERVICE_URL}/api/orders/internal/stats`);
      totalOrders = orderRes.data.totalOrders;
      revenue = orderRes.data.revenue;
      monthlySales = orderRes.data.monthlySales;
      topSellingProducts = orderRes.data.topSellingProducts;
    } catch (err) {
      console.error('Failed to fetch order stats:', err.message);
    }

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      categoryStats,
      monthlySales,
      topSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= INTERNAL ENDPOINTS =================

export const internalRegister = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone
    });

    if (user) {
      // Initialize cart in Cart Service via REST call if role is customer
      if (user.role === 'customer') {
        try {
          await axios.post(`${CART_SERVICE_URL}/api/cart/internal/init/${user._id}`);
        } catch (err) {
          console.error('Failed to initialize cart for new user:', err.message);
        }
      }
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const internalLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const batchGetUsers = async (req, res) => {
  const { userIds } = req.body;
  try {
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
