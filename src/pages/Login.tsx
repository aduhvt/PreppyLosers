import { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { API_URL } from "../config";

const stringifyMessage = (value: any, fallback: string): string => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value.message) return stringifyMessage(value.message, fallback);

  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

const getErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  return stringifyMessage(
    data?.details ||
      data?.error ||
      data?.message ||
      error?.message,
    fallback,
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"input" | "sent">("input");
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const formattedPhoneNumber = `+91${phoneNumber}`;

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
      setMessage(getErrorMessage(error, "Failed to send login link"));
      setMessageType("error");
    }
  };

  const sendPhoneOtp = async (e?: React.FormEvent, resend = false) => {
    if (e) e.preventDefault();

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      window.alert("invalid phone number");
      return;
    }

    try {
      setIsSendingOtp(true);
      setMessage("");

      await axios.post(`${API_URL}/api/auth/send-phone-otp`, {
        phoneNumber: formattedPhoneNumber,
      });

      setOtp("");
      setMessage(resend ? "OTP resent successfully" : "OTP sent successfully");
      setMessageType("success");
      setIsOtpVisible(true);
    } catch (error: any) {
      console.error("Phone OTP Error:", error);
      setMessage(getErrorMessage(error, "Failed to send OTP"));
      setMessageType("error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setMessage("Enter the 6-digit OTP");
      setMessageType("error");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setMessage("");

      const res = await axios.post(`${API_URL}/api/auth/verify-phone-otp`, {
        phoneNumber: formattedPhoneNumber,
        otp,
      });

      await login(res.data.token);
      navigate("/");
    } catch (error: any) {
      setOtp("");
      setMessage(getErrorMessage(error, "The OTP you entered is wrong"));
      setMessageType("error");
    } finally {
      setIsVerifyingOtp(false);
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
              <form onSubmit={isOtpVisible ? verifyPhoneOtp : sendPhoneOtp}>
                <p
                  style={{
                    fontSize: "14px",
                    marginBottom: "20px",
                    opacity: 0.7,
                  }}
                >
                  Enter your phone number to receive an SMS OTP.
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
                {!isOtpVisible && (
                  <button type="submit" disabled={isSendingOtp}>
                    {isSendingOtp ? "Sending..." : "Send SMS OTP"}
                  </button>
                )}

                {isOtpVisible && (
                  <>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: 0,
                        opacity: 0.7,
                      }}
                    >
                      Enter the 6-digit OTP sent to{" "}
                      <strong>+91 {phoneNumber}</strong> via SMS.
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      required
                    />
                    <button type="submit" disabled={isVerifyingOtp}>
                      {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                    </button>
                    <p
                      className="resend"
                      onClick={() => sendPhoneOtp(undefined, true)}
                      style={{
                        marginTop: "0",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Resend OTP
                    </p>
                  </>
                )}
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
                  width="320"
                />
                <button
                  onClick={() =>
                    setLoginMethod((currentMethod) => {
                      setOtp("");
                      setMessage("");
                      setMessageType("success");
                      setIsOtpVisible(false);
                      return currentMethod === "email" ? "phone" : "email";
                    })
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

        {message && <p className={`message ${messageType}`}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
