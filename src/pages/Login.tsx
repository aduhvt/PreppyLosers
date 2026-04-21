import { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"input" | "sent" | "otp">("input");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (response: any) => {
    try {
      // response.credential is the ID Token
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        token: response.credential,
      });

      await login(res.data.token);
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      setMessage("Google Login failed");
    }
  };

  // Google Login Component
  // Using the Google Login button component is often more reliable for ID tokens

  const sendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email,
      });

      setMessage(res.data.message);
      setStep("sent");
    } catch (error: any) {
      console.error("Frontend error:", error);
      setMessage(error.response?.data?.error || "Failed to send login link");
    }
  };

  const sendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      window.alert("invalid phone number");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/send-phone-otp`, {
        phoneNumber: `+91${phoneNumber}`,
      });

      setMessage(res.data.message);
      setStep("otp");
    } catch (error: any) {
      console.error("Phone OTP Error:", error);
      setMessage(error.response?.data?.error || "Failed to send WhatsApp OTP");
    }
  };

  const verifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-phone-otp`, {
        phoneNumber: `+91${phoneNumber}`,
        otp,
      });

      await login(res.data.token);
      navigate("/");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        {step === "input" && (
          <div className="fade-in">
            {loginMethod === "email" ? (
              <form onSubmit={sendMagicLink}>
                <p
                  style={{
                    fontSize: "14px",
                    marginBottom: "20px",
                    opacity: 0.7,
                  }}
                >
                  Enter your email to receive a secure login link.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Send Login Link</button>
              </form>
            ) : (
              <form onSubmit={sendPhoneOtp}>
                <p
                  style={{
                    fontSize: "14px",
                    marginBottom: "20px",
                    opacity: 0.7,
                  }}
                >
                  Enter your phone number to receive a WhatsApp OTP.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                    +91
                  </span>
                  <input
                    type="text"
                    placeholder="10 digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <button type="submit">Get WhatsApp OTP</button>
              </form>
            )}

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", alignItems: "center" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage("Google Login failed")}
                  theme="filled_black"
                  shape="pill"
                  width="100%"
                />
                <button
                  onClick={() =>
                    setLoginMethod(loginMethod === "email" ? "phone" : "email")
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "12px",
                    padding: "0 10px",
                    height: "40px",
                    borderRadius: "25px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {loginMethod === "email"
                    ? "Phone login"
                    : "Email login"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "sent" && (
          <div className="fade-in" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "20px" }}>✉️</div>
            <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
              A secure login link has been sent to <strong>{email}</strong>.
              Please check your inbox (and spam) to continue.
            </p>
            <button
              onClick={() => setStep("input")}
              style={{
                background: "transparent",
                border: "1px solid white",
                marginTop: "20px",
                color: "white",
              }}
            >
              Back
            </button>
          </div>
        )}

        {step === "otp" && (
          <form onSubmit={verifyPhoneOtp} className="fade-in">
            <p style={{ fontSize: "14px", marginBottom: "20px", opacity: 0.7 }}>
              Enter the 6-digit OTP sent to <strong>+91 {phoneNumber}</strong>{" "}
              via WhatsApp.
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>
            <p
              className="resend"
              onClick={() => setStep("input")}
              style={{
                marginTop: "15px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Change phone number
            </p>
          </form>
        )}

        {message && step === "input" && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
