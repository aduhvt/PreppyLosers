import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SmoothRotatingLogo from "../components/SmoothRotatingLogo";
import "./Cart.css";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  selectedSize: string;
  quantity: number;
  images: string[];
}

const Cart = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const removeItem = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      {/* MINIMALIST HEADER */}
      <header className="cart-header">
        <div className="cart-header-left" style={{ position: 'relative', width: '200px' }}>
          <SmoothRotatingLogo isVisible={logoVisible} />
        </div>

        <div className="cart-header-center">
          <h1>Preppy Losers</h1>
        </div>

        <div className="cart-header-right">
          {user ? (
            <div className="avatar-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="avatar-circle">{user.name?.charAt(0).toUpperCase()}</div>
              {dropdownOpen && (
                <div className="dropdown">
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">Orders</Link>
                  <div onClick={logout}>Logout</div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="cart-login-btn">Sign In</Link>
          )}
        </div>
      </header>

      {/* CART CONTENT */}
      <main className="cart-content">
        <h2 className="cart-title">Shopping Bag</h2>

        {cart.length === 0 ? (
          <div className="empty-cart-message">
            <p>Your shopping bag is currently empty.</p>
            <Link to="/products" className="back-to-shop-btn">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item, index) => (
                <div key={`${item._id}-${index}`} className="cart-item-card">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-info">Size: {item.selectedSize || 'N/A'}</p>
                    <p className="cart-item-price">₹ {item.price}</p>

                    <div className="cart-item-quantity-controls">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="qty-control-btn"
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="qty-control-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    className="cart-item-remove-btn"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary-section">
              <div className="cart-total-display">
                <span>Total:</span>
                <span style={{ marginLeft: '20px' }}>₹ {total}</span>
              </div>
              <button
                className="cart-checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Cart;
