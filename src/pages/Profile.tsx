import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import "./Profile.css";
import logo from "../assets/logo.png";
import profileBg from "../assets/profilepagehere.png";

type AddressBook = {
  fullName: string;
  address: string;
  apartment: string;
  city: string;
  pincode: string;
  phone: string;
  country: string;
};

const emptyAddressBook: AddressBook = {
  fullName: "",
  address: "",
  apartment: "",
  city: "",
  pincode: "",
  phone: "",
  country: "India",
};

const Profile = () => {
  const { user, refreshUser, login: authLogin } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [addressBook, setAddressBook] = useState<AddressBook>(emptyAddressBook);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  // Verification state
  const [emailCode, setEmailCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      const userPhone = user.phoneNumber || "";
      setPhoneNumber(userPhone.replace("+91", ""));
      
      setEmail(user.email || "");
      setIsEmailVerified(!!user.emailVerified);

      setAddressBook({
        ...emptyAddressBook,
        ...(user.addressBook || {}),
      });
    }
  }, [user]);

  const updateAddressBook = (field: keyof AddressBook, value: string) => {
    setAddressBook((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSendEmailVerification = async () => {
    setStatus("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Enter a valid email address");
      setStatusType("error");
      return;
    }
    try {
      setIsVerifying(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/auth/send-verification-email`, 
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEmailVerificationSent(true);
      setStatus("Verification code sent to your email");
      setStatusType("success");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to send verification code";
      setStatus(errorMsg);
      setStatusType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (emailCode.length !== 6) {
      setStatus("Enter the 6-digit code");
      setStatusType("error");
      return;
    }
    try {
      setIsVerifying(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/auth/verify-email-code`, 
        { email, code: emailCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.token) {
        await authLogin(res.data.token);
      }
      setIsEmailVerified(true);
      setEmailVerificationSent(false);
      setEmailCode("");
      setStatus("Email verified successfully");
      setStatusType("success");
    } catch (error: any) {
      setStatus(error.response?.data?.message || "Invalid or expired code");
      setStatusType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    if (email && !isEmailVerified && email !== user?.email) {
      setStatus("Please verify your email address first");
      setStatusType("error");
      return;
    }

    try {
      setIsSaving(true);
      setStatus("");

      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/users/profile`,
        {
          name: name.trim(),
          email: email ? email.trim() : null,
          phoneNumber: phoneNumber ? `+91${phoneNumber}` : null,
          addressBook: {
            ...addressBook,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await refreshUser();
      setStatus("Profile updated");
      setStatusType("success");
    } catch (error) {
      console.error(error);
      setStatus("Failed to update profile");
      setStatusType("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page" style={{ backgroundImage: `url(${profileBg})` }}>
      <div className="profile-shell">
        <header className="profile-header">
          <img src={logo} alt="Preppy Losers" className="profile-logo" />
          <p className="profile-kicker">Preppy Losers</p>
          <h1>Profile</h1>
        </header>

        <form className="profile-form" onSubmit={updateProfile}>
          <section className="profile-panel">
          {status && (
            <div className={`profile-message ${statusType}`} style={{ marginBottom: '15px', textAlign: 'center', width: '100%', fontWeight: 'bold' }}>
              {status}
            </div>
          )}
          <div className="panel-heading">
            <h2>Account Details</h2>
          </div>

          <label>
            Display name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </label>

          <div className="profile-field-row">
            {/* EMAIL COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Email</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
              />
              
              {isEmailVerified && email === user?.email && (
                <span style={{ color: '#16803a', fontSize: '12px', marginTop: '2px', fontWeight: 'bold' }}>
                  ✓ Email verified
                </span>
              )}

              {email && !isEmailVerified && !emailVerificationSent && (
                <span 
                  onClick={handleSendEmailVerification}
                  style={{ color: '#000', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', marginTop: '2px' }}
                >
                  {isVerifying ? "Sending..." : "Verify email"}
                </span>
              )}

              {/* INTEGRATED OTP FIELD */}
              {emailVerificationSent && !isEmailVerified && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '12px', 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid #000', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>ENTER OTP SENT TO MAIL</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      value={emailCode} 
                      onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      style={{ 
                        height: '36px', 
                        fontSize: '16px', 
                        textAlign: 'center', 
                        letterSpacing: '2px', 
                        background: '#fff',
                        border: '1px solid #ccc',
                        flex: 1,
                        padding: '0 5px'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyEmailCode}
                      disabled={isVerifying || emailCode.length !== 6}
                      style={{ 
                        height: '36px', 
                        background: '#000', 
                        color: '#fff', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        padding: '0 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {isVerifying ? "..." : "VERIFY"}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span onClick={handleSendEmailVerification} style={{ fontSize: '10px', textDecoration: 'underline', cursor: 'pointer' }}>
                      Resend
                    </span>
                    <span onClick={() => setEmailVerificationSent(false)} style={{ fontSize: '10px', textDecoration: 'underline', cursor: 'pointer', color: '#666' }}>
                      Cancel
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PHONE COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Phone number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>+91</span>
                <input 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10 digit number"
                />
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
          </section>

          <section className="profile-panel">
          <div className="panel-heading">
            <h2>Address Book</h2>
          </div>

          <label>
            Full name
            <input
              value={addressBook.fullName}
              onChange={(event) =>
                updateAddressBook("fullName", event.target.value)
              }
              placeholder="Full name for deliveries"
            />
          </label>

          <label>
            Address
            <input
              value={addressBook.address}
              onChange={(event) =>
                updateAddressBook("address", event.target.value)
              }
              placeholder="Street address"
            />
          </label>

          <label>
            Apartment, suite, etc.
            <input
              value={addressBook.apartment}
              onChange={(event) =>
                updateAddressBook("apartment", event.target.value)
              }
              placeholder="Optional"
            />
          </label>

          <div className="profile-field-row">
            <label>
              City
              <input
                value={addressBook.city}
                onChange={(event) =>
                  updateAddressBook("city", event.target.value)
                }
                placeholder="City"
              />
            </label>
            <label>
              Pincode
              <input
                value={addressBook.pincode}
                onChange={(event) =>
                  updateAddressBook("pincode", event.target.value)
                }
                inputMode="numeric"
                placeholder="Pincode"
              />
            </label>
          </div>

          <div className="profile-field-row">
            <label>
              Delivery phone
              <input
                value={addressBook.phone}
                onChange={(event) =>
                  updateAddressBook("phone", event.target.value)
                }
                inputMode="tel"
                placeholder="Phone for delivery"
              />
            </label>
            <label>
              Country
              <input
                value={addressBook.country}
                onChange={(event) =>
                  updateAddressBook("country", event.target.value)
                }
                placeholder="Country"
              />
            </label>
          </div>

          <div className="profile-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default Profile;
