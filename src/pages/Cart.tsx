import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  selectedSize: string;
  quantity: number;
  images: string[];
}

const Cart = () => {
  const navigate = useNavigate(); // ✅ correct hook placement

  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const removeItem = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Your Cart 🛒</h1>

      {cart.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Your cart is empty.</p>
      ) : (
        <>
          <div style={styles.cartList}>
            {cart.map((item, index) => (
              <div key={index} style={styles.card}>
                <img
                  src={item.images[0]}
                  alt={item.name}
                  style={styles.image}
                />

                <div style={styles.details}>
                  <h3>{item.name}</h3>
                  <p>Size: {item.selectedSize}</p>
                  <p>₹ {item.price}</p>

                  <div style={styles.quantity}>
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      style={styles.qtyBtn}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <h2>Total: ₹ {total}</h2>
            <button
              style={styles.checkoutBtn}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles: any = {
  container: {
    padding: "60px",
    color: "white",
    minHeight: "100vh",
    background: "#0e0e0e",
  },

  heading: {
    marginBottom: "40px",
    fontSize: "40px",
  },

  cartList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#151515",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },

  image: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "12px",
  },

  details: {
    flex: 1,
    marginLeft: "20px",
  },

  quantity: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },

  qtyBtn: {
    background: "#222",
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  removeBtn: {
    background: "transparent",
    border: "none",
    color: "red",
    fontSize: "20px",
    cursor: "pointer",
  },

  summary: {
    marginTop: "40px",
    textAlign: "right",
  },

  checkoutBtn: {
    marginTop: "15px",
    padding: "12px 24px",
    background: "white",
    color: "black",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};

export default Cart;
