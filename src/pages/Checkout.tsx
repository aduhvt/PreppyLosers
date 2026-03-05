import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  images: string[];
}

const Checkout = () => {
  const { user, logout } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showLogout, setShowLogout] = useState(false);
  const [differentBilling, setDifferentBilling] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    pincode: "",
    phone: "",
    email: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
    if (user) {
      setDeliveryAddress((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const handleDeliveryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    if (
      !deliveryAddress.firstName ||
      !deliveryAddress.address ||
      !deliveryAddress.city ||
      !deliveryAddress.pincode ||
      !deliveryAddress.phone
    ) {
      alert("Please fill all required delivery details");
      return;
    }

    const shippingAddress = {
      fullName: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
      address: deliveryAddress.address,
      city: deliveryAddress.city,
      pincode: deliveryAddress.pincode,
      phone: deliveryAddress.phone,
      country: deliveryAddress.country,
      apartment: deliveryAddress.apartment,
    };

    const billingAddr = differentBilling ? {
      fullName: `${billingAddress.firstName} ${billingAddress.lastName}`,
      address: billingAddress.address,
      city: billingAddress.city,
      pincode: billingAddress.pincode,
      phone: billingAddress.phone,
      country: billingAddress.country,
      apartment: billingAddress.apartment,
    } : shippingAddress;

    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: cart.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            image: item.images[0],
          })),
          shippingAddress,
          billingAddress: billingAddr,
          totalAmount: total,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "Preppy Losers",
        description: "Streetwear Purchase",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:5000/api/orders/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            if (verifyRes.data.success) {
              alert("Payment Successful! Order Placed 🔥");
              localStorage.removeItem("cart");
              window.location.href = "/orders";
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
          contact: deliveryAddress.phone,
          email: deliveryAddress.email,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Failed to initiate payment");
    }
  };

  const renderAddressFields = (type: "delivery" | "billing") => {
    const isDelivery = type === "delivery";
    const values = isDelivery ? deliveryAddress : billingAddress;
    const onChange = isDelivery ? handleDeliveryChange : handleBillingChange;

    return (
      <>
        <select
          name="country"
          className="checkout-input"
          value={values.country}
          onChange={onChange}
        >
          <option value="India">India</option>
        </select>
        <div className="input-row">
          <input
            name="firstName"
            placeholder="First name"
            className="checkout-input"
            value={values.firstName}
            onChange={onChange}
          />
          <input
            name="lastName"
            placeholder="Last name"
            className="checkout-input"
            value={values.lastName}
            onChange={onChange}
          />
        </div>
        <input
          name="address"
          placeholder="Address"
          className="checkout-input"
          value={values.address}
          onChange={onChange}
        />
        <input
          name="apartment"
          placeholder="Apartment, suite, etc. (optional)"
          className="checkout-input"
          value={values.apartment}
          onChange={onChange}
        />
        <div className="input-row">
          <input
            name="city"
            placeholder="City"
            className="checkout-input"
            value={values.city}
            onChange={onChange}
          />
          <input
            name="pincode"
            placeholder="Pincode"
            className="checkout-input"
            value={values.pincode}
            onChange={onChange}
          />
        </div>
        <input
          name="phone"
          placeholder="Phone"
          className="checkout-input"
          value={values.phone}
          onChange={onChange}
        />
      </>
    );
  };

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1 className="store-name">PREPPY LOSERS</h1>
      </header>

      <div className="checkout-content">
        <div className="checkout-left">
          <div className="contact-section">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              Contact
            </h2>
            {user ? (
              <div className="auth-info">
                <span>{user.email}</span>
                <div
                  className="dots-menu"
                  onClick={() => setShowLogout(!showLogout)}
                >
                  ⋮
                  {showLogout && (
                    <div className="logout-dropdown" onClick={logout}>
                      Sign out
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <a
                href="/login"
                style={{
                  color: "#333",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
              >
                Log in
              </a>
            )}
          </div>

          {!user && (
            <input
              name="email"
              placeholder="Email or mobile phone number"
              className="checkout-input"
              value={deliveryAddress.email}
              onChange={handleDeliveryChange}
            />
          )}

          <div className="checkbox-container">
            <input type="checkbox" id="news" />
            <label htmlFor="news">Email me about news and offers</label>
          </div>

          <h2 className="section-title">Delivery</h2>
          {renderAddressFields("delivery")}

          <h2 className="section-title">Shipping method</h2>
          <div className="shipping-method-box">
            <span>Free shipping - Pay online</span>
            <span style={{ fontWeight: "bold" }}>FREE</span>
          </div>

          <h2 className="section-title">Payment</h2>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            All transactions are secure and encrypted.
          </p>
          <div className="payment-box">
            <div className="payment-item">
              <input type="radio" checked readOnly />
              <label>Razorpay Secure (UPI, Cards, Int'l Cards, Wallets)</label>
            </div>
          </div>

          <h2 className="section-title">Billing address</h2>
          <div className="billing-section">
            <div
              className="billing-option"
              onClick={() => setDifferentBilling(false)}
            >
              <input type="radio" checked={!differentBilling} readOnly />
              <label>Same as shipping address</label>
            </div>
            <div
              className="billing-option"
              onClick={() => setDifferentBilling(true)}
            >
              <input type="radio" checked={differentBilling} readOnly />
              <label>Use a different billing address</label>
            </div>
            {differentBilling && (
              <div className="billing-details-form">
                {renderAddressFields("billing")}
              </div>
            )}
          </div>

          <button className="pay-now-btn" onClick={placeOrder}>
            Pay now
          </button>
        </div>

        <div className="checkout-right">
          <div className="order-summary">
            {cart.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-img-container">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="item-img"
                  />
                  <span className="item-qty-badge">{item.quantity}</span>
                </div>
                <div className="item-info">
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {item.selectedSize}
                  </div>
                </div>
                <div className="item-price">₹{item.price * item.quantity}</div>
              </div>
            ))}

            <div className="totals-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <div
                style={{ fontSize: "12px", color: "#666", textAlign: "right" }}
              >
                Including ₹0 in taxes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
