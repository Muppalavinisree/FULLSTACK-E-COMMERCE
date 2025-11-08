require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Product = require('./models/Product');
const CartItem = require('./models/CartItem');

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- MongoDB Connection --------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibecommerce';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// -------------------- Admin Password Middleware --------------------
function checkAdmin(req, res, next) {
  const pass = req.headers['x-admin-pass'] || '';
  if (process.env.ADMIN_PASS && pass === process.env.ADMIN_PASS) return next();
  return res.status(401).json({ error: 'Unauthorized (admin pass required)' });
}

// -------------------- File Upload Setup --------------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // ✅ create if not exists

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Serve uploaded images publicly
app.use('/uploads', express.static('uploads'));

// -------------------- Routes --------------------

//  Root Route
app.get('/', (req, res) => {
  res.send('🚀 VibeCommerce Backend Running');
});

//  GET /api/products → fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

//  POST /api/products → add new product (Admin only, supports image upload)
app.post('/api/products', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description = '', price = 0, category = '' } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
    if (price <= 0) return res.status(400).json({ error: 'Price must be positive' });

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image || 'https://cdn-icons-png.flaticon.com/512/679/679720.png';

    const product = await Product.create({ name, description, price, category, image });
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// PUT /api/products/:id → update product (Admin only, supports image upload)
app.put('/api/products/:id', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;

    // If new image uploaded
    if (req.file) {
      // Remove old image from uploads folder (optional)
      if (product.image && product.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ message: '✅ Product updated successfully', product });
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

app.delete('/api/products/:id', checkAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.image && product.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Product deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res
      .status(500)
      .json({ error: 'Failed to delete product', details: err.message });
  }
});

//  GET /api/cart → Items + Total
app.get('/api/cart', async (req, res) => {
  try {
    const items = await CartItem.find().lean();
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart → Add Item
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    if (qty < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let existing = await CartItem.findOne({ productId });
    if (existing) {
      existing.qty += Number(qty);
      await existing.save();
    } else {
      await CartItem.create({
        productId,
        name: product.name,
        price: product.price,
        qty,
        image: product.image || 'https://cdn-icons-png.flaticon.com/512/679/679720.png',
      });
    }

    const items = await CartItem.find();
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    res.json({ items, total });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

//  PUT /api/cart → Update Quantity
app.put('/api/cart', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    if (!productId || qty < 1)
      return res.status(400).json({ error: 'Invalid productId or qty' });

    const existing = await CartItem.findOne({ productId });
    if (!existing)
      return res.status(404).json({ error: 'Item not found in cart' });

    existing.qty = qty;
    await existing.save();

    const items = await CartItem.find();
    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart quantity' });
  }
});

//  DELETE /api/cart/:id → Remove Item
app.delete('/api/cart/:id', async (req, res) => {
  try {
    await CartItem.findByIdAndDelete(req.params.id);
    const items = await CartItem.find();
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});

//  POST /api/checkout → Mock Checkout & Clear Cart
app.post('/api/checkout', async (req, res) => {
  try {
    const { name = 'Guest', email = '', selectedIds = [] } = req.body;

    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      return res.status(400).json({ error: 'No selected items provided for checkout.' });
    }

    const items = await CartItem.find({ _id: { $in: selectedIds } }).lean();
    if (!items.length) return res.status(404).json({ error: 'Selected items not found in cart.' });

    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const receipt = {
      id: `RCPT-${Date.now()}`,
      name,
      email,
      total,
      items,
      timestamp: new Date().toISOString(),
    };

    await CartItem.deleteMany({ _id: { $in: selectedIds } });
    res.json({ receipt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
