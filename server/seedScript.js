const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const trendyCatalogue = [
  { 
    name: 'Cyber Aviator Classic', 
    category: 'Aviator', 
    price: 149, 
    originalPrice: 199, 
    description: 'Titanium frame, UV400 polarized lenses. Timeless style for the modern era.', 
    previewImage: '/sunglasses.png', 
    overlayImage: '/sunglasses.png', 
    badge: 'Bestseller', 
    rating: 5 
  },
  { 
    name: 'Stealth Wayfarer Noir', 
    category: 'Wayfarer', 
    price: 189, 
    originalPrice: 249, 
    description: 'Matte dark brown acetate frame. Bold profile, ultra-lightweight build.', 
    previewImage: '/2.png', 
    overlayImage: '/2.png', 
    badge: 'New', 
    rating: 4.5 
  },
  { 
    name: 'Old Bollywood Style', 
    category: 'Shield', 
    price: 210, 
    originalPrice: 279, 
    description: 'Futuristic wrap-around shield, anti-reflective coat.', 
    previewImage: '/3.png', 
    overlayImage: '/3.png', 
    badge: 'Limited', 
    rating: 5 
  },
  { 
    name: 'Arctic Sport Shield', 
    category: 'Sport', 
    price: 129, 
    originalPrice: 169, 
    description: 'Gold-wire rimless frames. Vintage soul, contemporary craftsmanship.', 
    previewImage: '/4.png', 
    overlayImage: '/4.png', 
    badge: null, 
    rating: 4 
  },
  { 
    name: 'Premium Hexagonal', 
    category: 'Round', 
    price: 229, 
    originalPrice: 299, 
    description: 'Aesthetic geometric hexagonal frame with subtle gold rims.', 
    previewImage: '/5.png', 
    overlayImage: '/5.png', 
    badge: 'Sale', 
    rating: 5 
  },
    { 
    name: 'Classic Black', 
    category: 'Aviator', 
    price: 155, 
    originalPrice: 199, 
    description: 'Decent, timeless black sunglasses that go with everything.', 
    previewImage: '/glasses-transparent.png',
    overlayImage: '/glasses-transparent.png',
    badge: 'Trending', 
    rating: 4.5 
  },
  { 
    name: 'Instagram Dark Brown', 
    category: 'Oversized', 
    price: 169, 
    originalPrice: 219, 
    description: 'Statement oversized square frame. Celebrity-approved dark gradient tone.', 
    previewImage: '/7.png', 
    overlayImage: '/7.png', 
    badge: 'Chic', 
    rating: 4 
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Cluster...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected! Clearing old data shadow layers...');
    
    await Product.deleteMany({});
    console.log('🗑️ Old collection cleared.');

    await Product.insertMany(trendyCatalogue);
    console.log('🚀 MongoDB successfully seeded with premium dynamic assets!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with fatal node error:', error);
    process.exit(1);
  }
};

seedDatabase();
