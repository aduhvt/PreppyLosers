import { useEffect, useState } from "react";
import axios from "axios";

interface Order {
  _id: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  user: { email: string };
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "https://preppy-back-end.onrender.com/api/admin/orders",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setOrders(res.data);
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");

    await axios.put(
      `https://preppy-back-end.onrender.com/api/admin/orders/${id}`,
      { paymentStatus: status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Admin Orders Dashboard</h1>

      {orders.map((order) => (
        <div key={order._id} style={styles.card}>
          <p><strong>User:</strong> {order.user.email}</p>
          <p><strong>Total:</strong> ₹ {order.totalAmount}</p>
          <p><strong>Status:</strong> {order.paymentStatus}</p>
          <p>{new Date(order.createdAt).toLocaleString()}</p>

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => updateStatus(order._id, "paid")}>
              Mark Paid
            </button>
            <button onClick={() => updateStatus(order._id, "shipped")}>
              Mark Shipped
            </button>
            <button onClick={() => updateStatus(order._id, "delivered")}>
              Mark Delivered
            </button>
          </div>
        </div>
      ))}
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
  card: {
    background: "#151515",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
};

export default AdminOrders;