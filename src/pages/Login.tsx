import { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";

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

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        token: tokenResponse.access_token,
      });

      await login(res.data.token);
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      setMessage("Google Login failed");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setMessage("Google Login failed"),
  });

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
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button
                  onClick={() => googleLogin()}
                  style={{
                    flex: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "black",
                    color: "white",
                    fontSize: "14px",
                    height: "45px",
                    borderRadius: "25px",
                    border: "1px solid #444",
                    fontWeight: "500",
                    padding: "0 20px"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.326 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.326 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Sign in with Google
                </button>
                <button
                  onClick={() =>
                    setLoginMethod(loginMethod === "email" ? "phone" : "email")
                  }
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "12px",
                    padding: "0 10px",
                    height: "45px",
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
