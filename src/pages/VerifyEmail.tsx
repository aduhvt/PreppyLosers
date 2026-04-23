import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("Invalid or missing verification information.");
        return;
      }

      try {
        const res = await axios.get(
          `${API_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`,
        );

        // Update auth state with new token
        await login(res.data.token);

        setStatus("Email verified successfully! Redirecting...");

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } catch (error: any) {
        console.error("Verification failed", error);
        setStatus(
          error.response?.data?.message ||
            "Email verification failed. The link may have expired.",
        );
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
          <button onClick={() => navigate("/profile")} style={styles.button}>
            Back to Profile
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
    fontFamily: "Inter, sans-serif",
  },
  card: {
    background: "#151515",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  title: {
    letterSpacing: "4px",
    marginBottom: "30px",
  },
  status: {
    fontSize: "18px",
    marginBottom: "20px",
    opacity: 0.9,
  },
  button: {
    background: "white",
    color: "black",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default VerifyEmail;
