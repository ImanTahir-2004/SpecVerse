const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const Product = require('./models/Product');
const Cart = require('./models/Cart');
// @route   GET /api/products
// @desc    Get all sunglasses for the dynamic shop grid
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single sunglass detail by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});
// ==========================================
// CART DATABASE APIs
// ==========================================

// 1. ADD TO CART ya QUANTITY INCREASE KARNA
app.post('/api/cart', async (req, res) => {
  const { productId } = req.body;
  try {
    // Check karein kya item pehle se cart mein hai?
    let cartItem = await Cart.findOne({ productId });
    
    if (cartItem) {
      // Agar hai to quantity +1 kar dein
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      // Agar naya hai to database mein insert karein
      cartItem = new Cart({ productId, quantity: 1 });
      await cartItem.save();
    }
    
    // Poora product details populate karke wapas bhejein
    const populatedItem = await Cart.findById(cartItem._id).populate('productId');
    res.status(200).json(populatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Cart add error', error: err.message });
  }
});

// 2. GET ALL CART ITEMS WITH PRODUCT DETAILS
app.get('/api/cart', async (req, res) => {
  try {
    // .populate('productId') se chashmay ka naam, price, image sab sath aa jayega
    const items = await Cart.find().populate('productId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Cart fetch error', error: err.message });
  }
});

// 3. REMOVE ITEM FROM CART COMPLETELY
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const deletedItem = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found in cart' });
    res.json({ success: true, message: 'Item removed from database cart' });
  } catch (err) {
    res.status(500).json({ message: 'Cart delete error', error: err.message });
  }
});
// 4. UPDATE QUANTITY (increase/decrease)
app.patch('/api/cart/:id', async (req, res) => {
  const { action } = req.body; // 'increase' ya 'decrease'
  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) return res.status(404).json({ message: 'Item not found' });

    if (action === 'increase') {
      cartItem.quantity += 1;
      await cartItem.save();
      const populated = await Cart.findById(cartItem._id).populate('productId');
      res.json(populated);
    } else if (action === 'decrease') {
      if (cartItem.quantity <= 1) {
        // Quantity 1 se km ho to item delete kar do
        await Cart.findByIdAndDelete(req.params.id);
        res.json({ deleted: true, _id: req.params.id });
      } else {
        cartItem.quantity -= 1;
        await cartItem.save();
        const populated = await Cart.findById(cartItem._id).populate('productId');
        res.json(populated);
      }
    }
  } catch (err) {
    res.status(500).json({ message: 'Quantity update error', error: err.message });
  }
});

app.get('/', (req, res) => res.send('SpecVerse API Production Node ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));