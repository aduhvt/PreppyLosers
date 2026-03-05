import { useEffect, useState } from "react";
import axios from "axios";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  images: string[];
}
// RAZORPAY TRIGGER

const Checkout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    if (
      !form.fullName ||
      !form.address ||
      !form.city ||
      !form.pincode ||
      !form.phone
    ) {
      alert("Please fill all details");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 1. Create the order in your Backend (which should now return a Razorpay Order ID)
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
          shippingAddress: form,
          totalAmount: total,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("Order Data from Backend:", data); // Add this to debug!
      
      // 2. Configure Razorpay Options

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your actual Test Key ID
        amount: data.order.amount, // Amount returned from backend (in paise)
        currency: "INR",
        name: "Preppy Losers",
        description: "Streetwear Purchase",
        order_id: data.order.id, // This comes from your backend Razorpay instance
        handler: async function (response: any) {
          try {
            // 3. Verify payment on your backend
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
              // Optional: Redirect to success page
              // window.location.href = "/success";
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: form.fullName,
          contact: form.phone,
        },
        theme: {
          color: "#000000", // Matches your black aesthetic
        },
      };

      // 4. Open the Razorpay Modal
      const rzp = new (window as any).Razorpay(options);

      console.log("Razorpay Order ID:", data.order.id); // debug

      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Failed to initiate payment");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Checkout</h1>

      <div style={styles.layout}>
        {/* Shipping Form */}
        <div style={styles.form}>
          <h2>Shipping Details</h2>

          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="address"
            placeholder="Address"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="city"
            placeholder="City"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="pincode"
            placeholder="Pincode"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {/* Order Summary */}
        <div style={styles.summary}>
          <h2>Order Summary</h2>

          {cart.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <span>{item.name}</span>
              <span>
                {item.quantity} × ₹{item.price}
              </span>
            </div>
          ))}

          <hr style={{ margin: "20px 0" }} />

          <h3>Total: ₹ {total}</h3>

          <button style={styles.checkoutBtn} onClick={placeOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: any = {
  container: {
    padding: "60px",
    color: "white",
    background: "#0e0e0e",
    minHeight: "100vh",
  },

  heading: {
    marginBottom: "40px",
  },

  layout: {
    display: "flex",
    gap: "40px",
  },

  form: {
    flex: 1,
    background: "#151515",
    padding: "30px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    background: "#222",
    color: "white",
  },

  summary: {
    width: "400px",
    background: "#151515",
    padding: "30px",
    borderRadius: "12px",
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  checkoutBtn: {
    marginTop: "20px",
    padding: "12px",
    background: "white",
    color: "black",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default Checkout;
