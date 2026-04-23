import { Link } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import SmoothRotatingLogo from "./SmoothRotatingLogo";
import { jwtDecode } from "jwt-decode";

type AuthTokenPayload = {
  phoneNumber?: string;
};

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);

  const getTokenPhoneNumber = () => {
    const token = localStorage.getItem("token");

    if (!token) return "";

    try {
      return jwtDecode<AuthTokenPayload>(token).phoneNumber || "";
    } catch {
      return "";
    }
  };

  const getAvatarLabel = () => {
    if (!user) return "?";

    const phoneNumber = user.phoneNumber || getTokenPhoneNumber();

    if (phoneNumber) {
      const phoneDigits = phoneNumber.replace(/\D/g, "");
      return phoneDigits.slice(-2) || "?";
    }

    if (user.name && user.name.trim() !== "") {
      return user.name
        .split(" ")
        .map((namePart: string) => namePart[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 1).toUpperCase();
    }

    return "?";
  };

  useEffect(() => {
    const hasSeenSplashBefore = sessionStorage.getItem("hasSeenSplashBefore");
    if (!hasSeenSplashBefore) {
      const timer = setTimeout(() => {
        setLogoVisible(true);
        sessionStorage.setItem("hasSeenSplashBefore", "true");
      }, 4500);
      return () => clearTimeout(timer);
    } else {
      setLogoVisible(true);
    }
  }, []);

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(wishlist.length);
    };
    updateWishlistCount();
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    return () =>
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalItems = cart.reduce(
        (acc: number, item: any) => acc + item.quantity,
        0
      );
      setCartCount(totalItems);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    };
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () =>
      window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  return (
    <div className="navbar-inner">
      {/* LEFT */}
      <div className="nav-left">
        <SmoothRotatingLogo isVisible={logoVisible} />
      </div>

      {/* CENTER */}
      <div className="nav-center">
        <h1>Preppy Losers</h1>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {user ? (
          <div
            className="avatar-wrapper"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="avatar-circle">{getAvatarLabel()}</div>

            {dropdownOpen && (
              <div className="dropdown">
                <Link to="/profile">Profile</Link>
                <Link to="/orders">Orders</Link>
                <div onClick={logout}>Logout</div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-icon-wrapper" title="Login">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </Link>
        )}

        {/* CART */}
        <Link to="/cart" className="cart-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M7 4H5L4 6H2V8H3L6 18H18L21 8H6.5" />
          </svg>
          <span className={`cart-badge ${animate ? "bounce" : ""}`}>
            {cartCount}
          </span>
        </Link>

        {/* WISHLIST */}
        <Link to="/wishlist" className="wishlist-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4 8.24 4 9.91 5.01 10.54 6.36 11.17 5.01 12.84 4 14.5 4 17 4 19 6 19 8.5 19 12.28 15.6 15.36 12 19.35z" />
          </svg>
          <span className="wishlist-badge">{wishlistCount}</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
