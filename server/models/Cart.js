const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // productId ko hum Product collection se link (reference) kar rahe hain
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1 
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);