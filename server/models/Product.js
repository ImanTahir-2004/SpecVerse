const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  category:      { type: String, default: 'General' },
  price:         { type: Number, required: true },
  originalPrice: { type: Number },
  description:   { type: String, default: '' },
  previewImage:  { type: String, required: true },
  overlayImage:  { type: String, required: true },
  badge:         { type: String, default: null },
  rating:        { type: Number, default: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);