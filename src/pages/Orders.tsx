import { useEffect, useState } from "react";
import axios from "axios";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://preppy-back-end.onrender.com/api/orders/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={styles.card}>
            <div style={styles.topRow}>
              <span>Order ID: {order._id.slice(-6)}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>

            {order.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <img src={item.image} style={styles.image} />
                <div>
                  <p>{item.name}</p>
                  <p>Size: {item.selectedSize}</p>
                  <p>
                    {item.quantity} × ₹{item.price}
                  </p>
                </div>
              </div>
            ))}

            <div style={styles.bottomRow}>
              <strong>Total: ₹ {order.totalAmount}</strong>
              <span>Status: {order.paymentStatus}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles: any = {
  container: {
    padding: "60px",
    background: "#0e0e0e",
    color: "white",
    minHeight: "100vh",
  },

  heading: {
    marginBottom: "40px",
  },

  card: {
    background: "#151515",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    opacity: 0.7,
  },

  itemRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
  },

  image: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    borderTop: "1px solid #222",
    paddingTop: "10px",
  },
};

export default Orders;