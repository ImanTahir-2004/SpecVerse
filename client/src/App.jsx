import React, { useState, useEffect } from 'react';
import TryOnModal from './components/TryOnModal';
import './App.css';

const FILTERS = ["All", "Aviator", "Wayfarer", "Shield", "Round", "Sport", "Oversized"];

function App() {
  const [products, setProducts] = useState([]); // Dynamic state from MongoDB
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  // Cart States (Connected to MongoDB)
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. Fetch Products AND Cart items from MongoDB on Load
  useEffect(() => {
    // Fetch all products
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Error fetching items from DB:", err));

    // Fetch existing cart items from database
    fetch('http://localhost:5000/api/cart')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCartItems(data);
        }
      })
      .catch(err => console.error("Error fetching cart from DB:", err));
  }, []);

  // Filter functionality updated according to backend fields
  const filteredProducts = activeFilter === "All"
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeFilter.toLowerCase());

  const handleTryOn = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  // 2. CONNECTED API: Add item / Increase quantity in MongoDB Database
  // 2. CONNECTED API: Add item / Increase quantity in MongoDB Database
const addToCartDatabase = (product, e) => {
  if (e) e.stopPropagation(); // Safe handle click propagation

  fetch('http://localhost:5000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: product._id })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then(() => {
      // Jab item add ho jaye, to direct fresh list DB se mangwatein hain bina nesting ke
      fetch('http://localhost:5000/api/cart')
        .then(res => res.json())
        .then(data => {
          // Check mapping explicitly
          if (Array.isArray(data)) {
            setCartItems(data);
          }
        });
    })
    .catch(err => console.error("Error saving cart item to DB:", err));
};
  // 3. CONNECTED API: Delete item completely from MongoDB Database
  const removeFromCartDatabase = (cartId) => {
    fetch(`http://localhost:5000/api/cart/${cartId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Client UI state ko instant update karne ke liye filter out kar rahe hain
          setCartItems(prev => prev.filter(item => item._id !== cartId));
        }
      })
      .catch(err => console.error("Error deleting cart item from DB:", err));
  };
const updateQuantity = (cartId, action) => {
  fetch(`http://localhost:5000/api/cart/${cartId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  })
    .then(res => res.json())
    .then(data => {
      if (data.deleted) {
        setCartItems(prev => prev.filter(item => item._id !== cartId));
      } else {
        setCartItems(prev => prev.map(item => item._id === cartId ? data : item));
      }
    })
    .catch(err => console.error('Quantity update error:', err));
};
  // Total Calculators traversing through nested populated productId objects safely
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Smooth scroll handler for Navbar links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          SPEC<span>VERSE</span>
        </div>
        <ul className="navbar-links">
          <li><button onClick={() => scrollToSection('collection')} className="nav-link-btn">Collection</button></li>
          <li><button onClick={() => scrollToSection('about')} className="nav-link-btn">About</button></li>
          <li><button onClick={() => scrollToSection('contact')} className="nav-link-btn">Contact</button></li>
        </ul>
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          🛒 Cart ({totalCartCount})
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-badge">✦ AI-Powered Try-On</div>
        <h1>
          See It On Your <span className="highlight">Face</span><br />
          Before You Buy
        </h1>
        <p>
          Premium eyewear meets real-time augmented reality. Try any pair instantly — no app, no upload needed.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">2K+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat">
            <span className="stat-num">50+</span>
            <span className="stat-label">Styles</span>
          </div>
          <div className="stat">
            <span className="stat-num">4.9★</span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
      </section>

      {/* DYNAMIC PRODUCTS COLLECTION */}
      <section id="collection" className="products-section">
        <div className="section-header">
          <h2>Our Collection</h2>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <p className="no-products-msg">No products found. Please seed your MongoDB database!</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                {product.badge && (
                  <span className="card-badge">{product.badge}</span>
                )}

                <div className="card-img-wrap">
                  <img src={product.previewImage} alt={product.name} />
                </div>

                <div className="card-body">
                  <div className="card-meta">
                    <span className="card-category">{product.category}</span>
                    <span className="card-rating">{"★".repeat(Math.round(product.rating || 5))}</span>
                  </div>
                  <h3 className="card-name">{product.name}</h3>
                  <p className="card-desc">{product.description}</p>

                  <div className="card-footer">
                    <span className="card-price">
                      ${product.price}
                      {product.originalPrice && <span className="original">${product.originalPrice}</span>}
                    </span>
                    <button
                      className={`wishlist-btn ${wishlist.includes(product._id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(product._id)}
                    >
                      {wishlist.includes(product._id) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      className="try-on-btn"
                      onClick={() => handleTryOn(product)}
                    >
                      📷 Try On
                    </button>
                    <button
                      className="try-on-btn"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        flex: '0 0 auto',
                        padding: '11px 16px'
                      }}
                      onClick={(e) => addToCartDatabase(product, e)}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="about-section" style={{ padding: '60px 20px', textAlign: 'center', background: '#0a0a0a' }}>
        <h2>About SpecVerse</h2>
        <p style={{ maxWidth: '600px', margin: '20px auto', color: '#aaa' }}>
          We blend state-of-the-art WebAR face tracking layout with hand-crafted geometric sunglasses design templates. Tracked perfectly via 68 coordinate matrix schemas for seamless local rendering.
        </p>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Get In Touch</h2>
        <p style={{ color: '#aaa' }}>Have feedback or custom dimensions requirements? Email our support node.</p>
      </section>

      {/* SIDEBAR CART DRAWER */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h3>Your Shopping Cart</h3>
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>
            
            {cartItems.length === 0 ? (
              <p className="empty-cart-text">Your cart is feeling light! Add some shades.</p>
            ) : (
              <div className="cart-drawer-content">
                <div className="cart-items-list">
                  {cartItems.map(item => {
                    // Safe unpacking of nested object populated from MongoDB ref model
                    const productDetails = item.productId || {};
                    return (
                     <div key={item._id} className="cart-item-row">
  <img src={productDetails.previewImage} alt={productDetails.name} className="cart-item-img" />
  <div className="cart-item-details">
    <h4>{productDetails.name || 'Eyewear Item'}</h4>
    <p className="cart-item-price">${productDetails.price || 0}</p>
    <div className="qty-controls">
      <button className="qty-btn" onClick={() => updateQuantity(item._id, 'decrease')}>−</button>
      <span className="qty-num">{item.quantity}</span>
      <button className="qty-btn" onClick={() => updateQuantity(item._id, 'increase')}>+</button>
    </div>
  </div>
  <button className="cart-item-remove" onClick={() => removeFromCartDatabase(item._id)}>🗑️</button>
</div>
                    );
                  })}
                </div>
                <div className="cart-drawer-footer">
                  <div className="cart-total-row">
                    <span>Total Amount:</span>
                    <span className="total-price">${cartTotal}</span>
                  </div>
                 <button className="checkout-btn" onClick={() => { setIsCartOpen(false); setShowCheckoutModal(true); }}>Checkout Now</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">SPECVERSE</div>
        <p>© 2026 SpecVerse. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 Camera stays on your device. Never uploaded.
        </p>
        {/* CHECKOUT SUCCESS MODAL */}
{showCheckoutModal && (
  <div className="cart-overlay" onClick={() => setShowCheckoutModal(false)}>
    <div className="checkout-modal" onClick={e => e.stopPropagation()}>
      <div className="checkout-icon">✦</div>
      <h2>Order Confirmed!</h2>
      <p>Your shades are on their way. Stay stylish. 😎</p>
      <div className="checkout-total-display">
        Total Paid: <span>${cartTotal}</span>
      </div>
      <button className="checkout-close-btn" onClick={() => { setShowCheckoutModal(false); setCartItems([]); }}>
        Continue Shopping
      </button>
    </div>
  </div>
)}
      </footer>

      {/* AR TRY ON LIVE MODAL */}
      {isModalOpen && selectedProduct && (
        <TryOnModal
          product={{
            ...selectedProduct,
            overlayImage: selectedProduct.overlayImage
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default App;