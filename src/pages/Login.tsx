import { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // THIS STOPS PAGE REFRESH

    console.log("sendOtp triggered");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email,
      });

      console.log("Response:", res.data);
      setMessage(res.data.message);
      setStep("otp");
    } catch (error: any) {
      console.error("Frontend error:", error);
      setMessage("Failed to send OTP");
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp },
      );

      // 🔐 Save JWT
      localStorage.setItem("token", res.data.token);

      localStorage.setItem("token", res.data.token);

      navigate("/");

      setMessage("Login successful");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        {step === "email" && (
          <form onSubmit={sendOtp} className="fade-in">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Continue</button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp} className="fade-in">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>

            {timer > 0 ? (
              <p className="resend">Resend OTP in {timer}s</p>
            ) : (
              <p className="resend" onClick={() => sendOtp()}>
                Resend OTP
              </p>
            )}
          </form>
        )}

        {message && <p className="message">{message}</p>}

        <button onClick={testProtected}>Test Protected Route</button>
      </div>
    </div>
  );
};

const testProtected = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5000/api/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(res.data);
  } catch (error: any) {
    console.error("Protected route error:", error.response?.data);
  }
};

export default Login;
