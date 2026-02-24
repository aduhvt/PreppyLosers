import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Cart counter effect
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const totalItems = cart.reduce(
        (acc: number, item: any) => acc + item.quantity,
        0,
      );

      setCartCount(totalItems);

      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    };

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // JWT decode effect (SEPARATE)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded: any = jwtDecode(token);

      const email = decoded.email;

      const initials = email.substring(0, 2).toUpperCase();

      setUserInitials(initials);
    }
  }, []);

  return (
    <div className="navbar-inner">
      {/* LEFT - Logo */}
      <div className="nav-left">
        <img src={logo} alt="logo" className="logo" />
      </div>

      {/* CENTER - Brand Title */}
      <div className="nav-center">
        <h1>Preppy Losers</h1>
      </div>

      {/* RIGHT - Links */}
      <div className="nav-right">
        <Link to="/about" className="nav-link">
          About
        </Link>
        {user ? (
          <div
            className="avatar-wrapper"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="avatar-circle">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {dropdownOpen && (
              <div className="dropdown">
                <Link to="/profile">Profile</Link>
                <Link to="/orders">Orders</Link>
                <div onClick={logout}>Logout</div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}
        <Link to="/products" className="nav-link">
          Shop
        </Link>
        
        <Link to="/cart" className="cart-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M7 4H5L4 6H2V8H3L6 18H18L21 8H6.5" />
          </svg>
          <span className={`cart-badge ${animate ? "bounce" : ""}`}>
            {cartCount}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
