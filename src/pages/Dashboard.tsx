import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Welcome to Dashboard 🔥</h1>
      <p>You are logged in successfully.</p>

      <button onClick={logout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
