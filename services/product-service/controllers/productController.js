import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { uploadImage } from '../middleware/upload.js';
import axios from 'axios';

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:5004';

// Sync helpers
const syncCreate = async (product) => {
  try {
    await axios.post(`${SEARCH_SERVICE_URL}/api/search/sync`, product);
  } catch (err) {
    console.error('Failed to sync product create to search service:', err.message);
  }
};

const syncUpdate = async (id, product) => {
  try {
    await axios.put(`${SEARCH_SERVICE_URL}/api/search/sync/${id}`, product);
  } catch (err) {
    console.error('Failed to sync product update to search service:', err.message);
  }
};

const syncDelete = async (id) => {
  try {
    await axios.delete(`${SEARCH_SERVICE_URL}/api/search/sync/${id}`);
  } catch (err) {
    console.error('Failed to sync product delete to search service:', err.message);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });
      res.json({ ...product._doc, reviews });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      subcategory,
      description,
      price,
      discount,
      stock,
      color,
      display,
      processor,
      ram,
      storage,
      camera,
      battery,
      os,
      charging,
      network
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }
    } else {
      imageUrls.push('/uploads/default-phone.png');
    }

    const product = new Product({
      name,
      brand,
      category,
      subcategory,
      description,
      images: imageUrls,
      price: Number(price),
      discount: Number(discount || 0),
      stock: Number(stock || 0),
      color,
      specifications: {
        display,
        processor,
        ram,
        storage,
        camera,
        battery,
        os,
        charging,
        network
      },
      sellerId: req.user._id
    });

    const createdProduct = await product.save();
    
    // Sync to search service
    await syncCreate(createdProduct);

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }

      product.name = req.body.name || product.name;
      product.brand = req.body.brand || product.brand;
      product.category = req.body.category || product.category;
      product.subcategory = req.body.subcategory || product.subcategory;
      product.description = req.body.description || product.description;
      product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
      product.discount = req.body.discount !== undefined ? Number(req.body.discount) : product.discount;
      product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
      product.color = req.body.color || product.color;

      if (product.specifications) {
        product.specifications = {
          display: req.body.display || product.specifications.display,
          processor: req.body.processor || product.specifications.processor,
          ram: req.body.ram || product.specifications.ram,
          storage: req.body.storage || product.specifications.storage,
          camera: req.body.camera || product.specifications.camera,
          battery: req.body.battery || product.specifications.battery,
          os: req.body.os || product.specifications.os,
          charging: req.body.charging || product.specifications.charging,
          network: req.body.network || product.specifications.network
        };
      }

      if (req.files && req.files.length > 0) {
        let newImageUrls = [];
        for (const file of req.files) {
          const url = await uploadImage(file);
          newImageUrls.push(url);
        }
        product.images = newImageUrls;
      }

      const updatedProduct = await product.save();

      // Sync to search service
      await syncUpdate(updatedProduct._id, updatedProduct);

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }

      await Product.deleteOne({ _id: req.params.id });

      // Sync delete to search service
      await syncDelete(req.params.id);

      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private (Customer only)
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({
        userId: req.user._id,
        productId: product._id
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed by you' });
      }

      const review = await Review.create({
        userId: req.user._id,
        productId: product._id,
        rating: Number(rating),
        comment,
        userName: req.user.name
      });

      // Get updated product with reviewsCount & ratings from DB (post-save hook on Review runs)
      const updatedProduct = await Product.findById(product._id);
      
      // Sync update to search service
      await syncUpdate(product._id, updatedProduct);

      res.status(201).json({ message: 'Review added', review });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= INTERNAL ENDPOINTS =================

export const getProductsBatch = async (req, res) => {
  const { productIds } = req.body;
  try {
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name brand price discount images stock');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateAndDecrementStock = async (req, res) => {
  const { items } = req.body;
  try {
    // Validate stock
    const productsToUpdate = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name || item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.name || product.name}. Available: ${product.stock}` });
      }
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // Decrement stock
    for (const entry of productsToUpdate) {
      entry.product.stock -= entry.quantity;
      const updatedProduct = await entry.product.save();
      // Sync each updated product with search service
      await syncUpdate(updatedProduct._id, updatedProduct);
    }

    res.json({ message: 'Stock validated and decremented successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    
    // Category aggregation
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalProducts,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
