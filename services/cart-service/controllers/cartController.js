import Cart from '../models/Cart.js';
import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';

// Helper function to simulate mongoose populate by making a REST call to Product Service
const populateCart = async (cart) => {
  if (!cart) return null;
  if (!cart.items || cart.items.length === 0) {
    // Return cart object as is
    return cart.toObject ? cart.toObject() : cart;
  }

  const productIds = cart.items.map((item) => item.productId.toString());

  try {
    const response = await axios.post(`${PRODUCT_SERVICE_URL}/api/products/batch`, { productIds });
    const products = response.data;

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const cartObj = cart.toObject ? cart.toObject() : cart;
    const populatedItems = cartObj.items.map((item) => {
      const prodDetails = productMap[item.productId.toString()];
      return {
        _id: item._id,
        productId: prodDetails || { _id: item.productId, name: 'Product Not Found', price: 0, stock: 0, images: [] },
        quantity: item.quantity
      };
    });

    cartObj.items = populatedItems;
    return cartObj;
  } catch (error) {
    console.error('Failed to populate cart items via Product Service batch API:', error.message);
    return cart.toObject ? cart.toObject() : cart;
  }
};

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const populated = await populateCart(cart);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Validate if product exists in Product Service
    let productExists = false;
    try {
      const prodRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
      if (prodRes.data) {
        productExists = true;
      }
    } catch (err) {
      console.error('Product validation failed:', err.message);
    }

    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity || 1);
    } else {
      cart.items.push({ productId, quantity: Number(quantity || 1) });
    }

    await cart.save();
    
    const populated = await populateCart(cart);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id (Here, :id is the productId)
// @access  Private
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Number(quantity);
      await cart.save();

      const populated = await populateCart(cart);
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:id (Here, :id is the productId)
// @access  Private
export const deleteCartItem = async (req, res) => {
  const productId = req.params.id;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    const populated = await populateCart(cart);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= INTERNAL ENDPOINTS =================

export const internalInitCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const internalClearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
