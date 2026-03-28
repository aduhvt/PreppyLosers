import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const VerifyLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Verifying your link...");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("Invalid or missing token.");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-link?token=${token}`);
        
        // Use the context login to set user and fetch profile
        await login(res.data.token);
        
        setStatus("Success! Redirecting...");
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error: any) {
        console.error("Verification failed", error);
        setStatus(error.response?.data?.message || "Link verification failed. It may have expired.");
      }
    };

    verifyToken();
  }, [searchParams, login, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>PREPPY LOSERS</h2>
        <div style={styles.status}>{status}</div>
        {status.includes("failed") && (
          <button onClick={() => navigate("/login")} style={styles.button}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

const styles: any = {
  container: {
    height: "100vh",
    background: "#0e0e0e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontFamily: "Inter, sans-serif"
  },
  card: {
    background: "#151515",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },
  title: {
    letterSpacing: "4px",
    marginBottom: "30px"
  },
  status: {
    fontSize: "18px",
    marginBottom: "20px",
    opacity: 0.9
  },
  button: {
    background: "white",
    color: "black",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  }
};

export default VerifyLink;
