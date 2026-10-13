const mongoose = require('mongoose');

const users = [
  {
    name: 'System Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
    addresses: [
      {
        street: '123 Admin Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        isDefault: true
      }
    ]
  },
  {
    name: 'Smart Retailer',
    email: 'seller@gmail.com',
    password: 'seller123',
    role: 'seller',
    phone: '9876543211',
    addresses: [
      {
        street: '456 Business Blvd',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
        isDefault: true
      }
    ]
  },
  {
    name: 'Abhinav Customer',
    email: 'customer@gmail.com',
    password: 'customer123',
    role: 'customer',
    phone: '9876543212',
    addresses: [
      {
        street: '789 Residential Way',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
        isDefault: true
      }
    ]
  }
];

const productsTemplate = (sellerId) => [
  {
    name: 'Apple iPhone 15 Pro',
    brand: 'Apple',
    category: 'Mobile Phones',
    subcategory: 'Apple iPhone',
    description: 'The iPhone 15 Pro is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and a powerful camera system.',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'
    ],
    price: 134900,
    discount: 5,
    specifications: {
      display: '6.1-inch Super Retina XDR OLED, 120Hz',
      processor: 'A17 Pro chip',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
      battery: '3274 mAh',
      os: 'iOS',
      charging: '25W fast charging, MagSafe wireless',
      network: '5G, 4G LTE, Wi-Fi 6E, Bluetooth 5.3'
    },
    color: 'Natural Titanium',
    stock: 25,
    sellerId
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Mobile Phones',
    subcategory: 'Samsung',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80'
    ],
    price: 129999,
    discount: 10,
    specifications: {
      display: '6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz',
      processor: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB',
      storage: '512GB',
      camera: '200MP Main + 50MP + 12MP + 10MP Quad Camera',
      battery: '5000 mAh',
      os: 'Android',
      charging: '45W Fast Charging, Wireless Charging 2.0',
      network: '5G, Wi-Fi 7, Bluetooth 5.3, UWB'
    },
    color: 'Titanium Gray',
    stock: 18,
    sellerId
  },
  {
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    category: 'Mobile Phones',
    subcategory: 'Google Pixel',
    description: 'The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and can help you do more, even faster.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
    ],
    price: 93999,
    discount: 12,
    specifications: {
      display: '6.7-inch Super Actua display, 120Hz',
      processor: 'Google Tensor G3',
      ram: '12GB',
      storage: '128GB',
      camera: '50MP Main + 48MP Ultra Wide + 48MP 5x Telephoto',
      battery: '5050 mAh',
      os: 'Android',
      charging: '30W Wired charging, Qi wireless',
      network: '5G, Wi-Fi 7, NFC, Bluetooth 5.3'
    },
    color: 'Bay Blue',
    stock: 12,
    sellerId
  },
  {
    name: 'OnePlus 12',
    brand: 'OnePlus',
    category: 'Mobile Phones',
    subcategory: 'OnePlus',
    description: 'Redefined flagship specifications. OnePlus 12 combines elite-tier performance with high-end camera setups tuned by Hasselblad.',
    images: [
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=80'
    ],
    price: 64999,
    discount: 8,
    specifications: {
      display: '6.82-inch 2K Oriental AMOLED, 120Hz',
      processor: 'Snapdragon 8 Gen 3',
      ram: '16GB',
      storage: '512GB',
      camera: '50MP Sony LYT-808 + 64MP Telephoto + 48MP Ultra Wide',
      battery: '5400 mAh',
      os: 'Android',
      charging: '100W SuperVOOC Wired, 50W AirVOOC Wireless',
      network: '5G, LinkBoost, Wi-Fi 7, Bluetooth 5.4'
    },
    color: 'Flowy Emerald',
    stock: 22,
    sellerId
  },
  {
    name: 'Anker PowerPort III 65W Pod',
    brand: 'Chargers',
    category: 'Accessories',
    subcategory: 'Chargers',
    description: 'High-speed USB-C charger equipped with PowerIQ 3.0 technology, perfect for iPhones, Samsungs, and USB-C laptops.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
    ],
    price: 2999,
    discount: 15,
    specifications: {
      display: 'N/A',
      processor: 'N/A',
      ram: 'N/A',
      storage: 'N/A',
      camera: 'N/A',
      battery: 'N/A',
      os: 'N/A',
      charging: '65W Power Delivery output',
      network: 'N/A'
    },
    color: 'White',
    stock: 150,
    sellerId
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Accessories',
    subcategory: 'Headphones',
    description: 'Industry-leading noise-canceling headphones with premium sound quality, crystal-clear hands-free calling, and 30-hour battery life.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
    ],
    price: 29990,
    discount: 10,
    specifications: {
      display: 'N/A',
      processor: 'V1 Integrated Processor',
      ram: 'N/A',
      storage: 'N/A',
      camera: 'N/A',
      battery: '30 hours playback',
      os: 'N/A',
      charging: 'USB-C fast charge (3 min for 3 hours)',
      network: 'Bluetooth 5.2, Multipoint Connection'
    },
    color: 'Silver',
    stock: 45,
    sellerId
  },
  {
    name: 'Spigen Ultra Hybrid Case - iPhone 15 Pro',
    brand: 'Spigen',
    category: 'Accessories',
    subcategory: 'Mobile Covers',
    description: 'Transparent drop protection bumper cover case designed specifically for Apple iPhone 15 Pro.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80'
    ],
    price: 1899,
    discount: 20,
    specifications: {
      display: 'N/A',
      processor: 'N/A',
      ram: 'N/A',
      storage: 'N/A',
      camera: 'N/A',
      battery: 'N/A',
      os: 'N/A',
      charging: 'MagSafe compatible',
      network: 'N/A'
    },
    color: 'Crystal Clear',
    stock: 200,
    sellerId
  },
  {
    name: 'Apple Watch Series 9 GPS',
    brand: 'Apple',
    category: 'Accessories',
    subcategory: 'Smart Watches',
    description: 'Smartwatch featuring double tap gesture control, brighter Always-On Retina display, crash detection, and fitness metrics tracker.',
    images: [
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop&q=80'
    ],
    price: 41900,
    discount: 8,
    specifications: {
      display: 'Always-On Retina LTPO OLED, 2000 nits',
      processor: 'S9 SiP',
      ram: 'N/A',
      storage: '64GB',
      camera: 'N/A',
      battery: '18 hours all-day battery, Low Power Mode',
      os: 'watchOS',
      charging: 'Magnetic fast charger to USB-C',
      network: 'Wi-Fi, Bluetooth 5.3, NFC'
    },
    color: 'Midnight Aluminum',
    stock: 30,
    sellerId
  }
];

const seedData = async () => {
  let connUser, connProduct, connSearch, connCart, connOrder;
  try {
    const bcrypt = require('bcryptjs');

    // Create DB Connections
    const MONGO_HOST = process.env.MONGO_HOST || 'localhost:27017';
    connUser = await mongoose.createConnection(`mongodb://${MONGO_HOST}/ecom-user`).asPromise();
    connProduct = await mongoose.createConnection(`mongodb://${MONGO_HOST}/ecom-product`).asPromise();
    connSearch = await mongoose.createConnection(`mongodb://${MONGO_HOST}/ecom-search`).asPromise();
    connCart = await mongoose.createConnection(`mongodb://${MONGO_HOST}/ecom-cart`).asPromise();
    connOrder = await mongoose.createConnection(`mongodb://${MONGO_HOST}/ecom-order`).asPromise();

    console.log(`Connected to all 5 microservice databases at ${MONGO_HOST}.`);

    // Define schemas / models
    const addressSchema = new mongoose.Schema({
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      isDefault: { type: Boolean, default: false }
    });

    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, default: 'customer' },
      phone: { type: String },
      addresses: [addressSchema],
      profileImage: { type: String, default: '' }
    }, { timestamps: true });

    // Hook to hash password before save
    userSchema.pre('save', async function () {
      if (!this.isModified('password')) return;
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    });

    const productSchema = new mongoose.Schema({
      name: { type: String, required: true },
      brand: { type: String, required: true },
      category: { type: String, required: true },
      subcategory: { type: String, required: true },
      description: { type: String, required: true },
      images: [{ type: String }],
      price: { type: Number, required: true, default: 0 },
      discount: { type: Number, default: 0 },
      specifications: mongoose.Schema.Types.Mixed,
      color: { type: String },
      stock: { type: Number, required: true, default: 0 },
      sellerId: { type: mongoose.Schema.Types.ObjectId, required: true },
      ratings: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 }
    }, { timestamps: true });

    const reviewSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
      userName: { type: String, required: true }
    }, { timestamps: true });

    const cartSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
      items: [{ productId: { type: mongoose.Schema.Types.ObjectId, required: true }, quantity: { type: Number, default: 1 } }]
    }, { timestamps: true });

    const orderSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      products: [{ productId: { type: mongoose.Schema.Types.ObjectId, required: true }, name: String, quantity: Number, price: Number, image: String }],
      shippingAddress: mongoose.Schema.Types.Mixed,
      paymentMethod: String,
      paymentStatus: String,
      paymentId: String,
      totalAmount: Number,
      orderStatus: { type: String, default: 'Processing' }
    }, { timestamps: true });

    const ModelUser = connUser.model('User', userSchema);
    const ModelProduct = connProduct.model('Product', productSchema);
    const ModelReview = connProduct.model('Review', reviewSchema);
    const ModelSearchProduct = connSearch.model('Product', productSchema);
    const ModelCart = connCart.model('Cart', cartSchema);
    const ModelOrder = connOrder.model('Order', orderSchema);

    // Drop collections / clear databases
    await ModelUser.deleteMany({});
    await ModelProduct.deleteMany({});
    await ModelReview.deleteMany({});
    await ModelSearchProduct.deleteMany({});
    await ModelCart.deleteMany({});
    await ModelOrder.deleteMany({});

    console.log('Cleared all collections.');

    // Seed Users
    // Trigger save middleware individually to hash passwords
    const createdUsers = [];
    for (const u of users) {
      const userDoc = new ModelUser(u);
      await userDoc.save();
      createdUsers.push(userDoc);
    }
    console.log(`${createdUsers.length} Users seeded.`);

    const seller = createdUsers.find(user => user.role === 'seller');
    const customer = createdUsers.find(user => user.role === 'customer');

    if (customer) {
      await ModelCart.create({ userId: customer._id, items: [] });
      console.log('Customer cart initialized.');
    }

    // Seed Products
    const products = productsTemplate(seller._id);
    const createdProducts = await ModelProduct.create(products);
    // Write same products to search db
    await ModelSearchProduct.create(products.map((p, index) => ({
      ...p,
      _id: createdProducts[index]._id
    })));
    console.log(`${createdProducts.length} Products seeded into both Catalog and Search DBs.`);

    // Reviews
    const iphone = createdProducts.find(p => p.name.includes('iPhone'));
    const galaxy = createdProducts.find(p => p.name.includes('Galaxy'));

    if (iphone && customer) {
      await ModelReview.create({
        userId: customer._id,
        productId: iphone._id,
        rating: 5,
        comment: 'Absolutely love the natural titanium texture! Super fast processor and battery is solid.',
        userName: customer.name
      });
      // Update ratings & reviewsCount
      await ModelProduct.findByIdAndUpdate(iphone._id, { ratings: 5, reviewsCount: 1 });
      await ModelSearchProduct.findByIdAndUpdate(iphone._id, { ratings: 5, reviewsCount: 1 });
      console.log('iPhone review seeded.');
    }

    if (galaxy && customer) {
      await ModelReview.create({
        userId: customer._id,
        productId: galaxy._id,
        rating: 5,
        comment: 'AI search features are outstanding. Zoom lens is incredibly detailed. The best phone screen on the market.',
        userName: customer.name
      });
      // Update ratings & reviewsCount
      await ModelProduct.findByIdAndUpdate(galaxy._id, { ratings: 5, reviewsCount: 1 });
      await ModelSearchProduct.findByIdAndUpdate(galaxy._id, { ratings: 5, reviewsCount: 1 });
      console.log('Galaxy review seeded.');
    }

    // Orders
    if (customer && iphone && galaxy) {
      const order1 = await ModelOrder.create({
        userId: customer._id,
        products: [
          {
            productId: iphone._id,
            name: iphone.name,
            quantity: 1,
            price: iphone.price - (iphone.price * iphone.discount) / 100,
            image: iphone.images[0]
          }
        ],
        shippingAddress: customer.addresses[0],
        paymentMethod: 'Card',
        paymentStatus: 'Paid',
        paymentId: 'ch_mock12345',
        totalAmount: iphone.price - (iphone.price * iphone.discount) / 100,
        orderStatus: 'Delivered'
      });

      const order2 = await ModelOrder.create({
        userId: customer._id,
        products: [
          {
            productId: galaxy._id,
            name: galaxy.name,
            quantity: 1,
            price: galaxy.price - (galaxy.price * galaxy.discount) / 100,
            image: galaxy.images[0]
          }
        ],
        shippingAddress: customer.addresses[0],
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        totalAmount: galaxy.price - (galaxy.price * galaxy.discount) / 100,
        orderStatus: 'Processing'
      });

      console.log('Initial orders seeded.');
    }

    console.log('Database Seeding Completed Successfully for all microservices!');
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
  } finally {
    if (connUser) await connUser.close();
    if (connProduct) await connProduct.close();
    if (connSearch) await connSearch.close();
    if (connCart) await connCart.close();
    if (connOrder) await connOrder.close();
    process.exit(0);
  }
};

seedData();
