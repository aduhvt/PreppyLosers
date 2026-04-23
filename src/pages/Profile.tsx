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
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [addressBook, setAddressBook] = useState<AddressBook>(emptyAddressBook);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  // Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    const userPhone = user?.phoneNumber || "";
    setPhoneNumber(userPhone.replace("+91", ""));
    setIsPhoneVerified(!!user?.phoneNumber);
    
    setEmail(user?.email || "");
    setIsEmailVerified(!!user?.email);

    setAddressBook({
      ...emptyAddressBook,
      ...(user?.addressBook || {}),
    });
  }, [user]);

  const updateAddressBook = (field: keyof AddressBook, value: string) => {
    setAddressBook((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSendEmailVerification = async () => {
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
      setStatus("Verification link sent to your email");
      setStatusType("success");
    } catch (error: any) {
      setStatus(error.response?.data?.error || "Failed to send verification email");
      setStatusType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setStatus("Enter a valid 10-digit number");
      setStatusType("error");
      return;
    }
    try {
      setIsVerifying(true);
      await axios.post(`${API_URL}/api/auth/send-phone-otp`, {
        phoneNumber: `+91${phoneNumber}`,
      });
      setOtpSent(true);
      setStatus("Verification code sent via SMS");
      setStatusType("success");
    } catch (error: any) {
      setStatus(error.response?.data?.error || "Failed to send SMS");
      setStatusType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      await axios.post(`${API_URL}/api/auth/verify-phone-otp`, {
        phoneNumber: `+91${phoneNumber}`,
        otp,
      });
      setIsPhoneVerified(true);
      setOtpSent(false);
      setStatus("Phone number verified");
      setStatusType("success");
    } catch (error: any) {
      setStatus(error.response?.data?.message || "Invalid OTP");
      setStatusType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    if (phoneNumber && !isPhoneVerified && phoneNumber !== user?.phoneNumber?.replace("+91", "")) {
      setStatus("Please verify your phone number first");
      setStatusType("error");
      return;
    }

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
            fullName: addressBook.fullName.trim(),
            address: addressBook.address.trim(),
            apartment: addressBook.apartment.trim(),
            city: addressBook.city.trim(),
            pincode: addressBook.pincode.trim(),
            phone: addressBook.phone.trim(),
            country: addressBook.country.trim() || "India",
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

  const isPhoneChanged = phoneNumber !== user?.phoneNumber?.replace("+91", "");
  const isEmailChanged = email !== user?.email;

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
            <label>
              Email
              <input 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value !== user?.email) {
                    setIsEmailVerified(false);
                  } else {
                    setIsEmailVerified(true);
                  }
                }}
                placeholder="Enter your email" 
              />
              {email && isEmailChanged && !isEmailVerified && !emailVerificationSent && (
                <span 
                  onClick={handleSendEmailVerification}
                  style={{ color: '#000', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}
                >
                  Verify email
                </span>
              )}
              {emailVerificationSent && isEmailChanged && !isEmailVerified && (
                <span style={{ color: '#000', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                  Check your inbox for the link
                </span>
              )}
            </label>
            <label>
              Phone number
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>+91</span>
                <input 
                  value={phoneNumber} 
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (e.target.value !== user?.phoneNumber?.replace("+91", "")) {
                      setIsPhoneVerified(false);
                    } else {
                      setIsPhoneVerified(true);
                    }
                  }}
                  placeholder="10 digit number"
                />
              </div>
              {phoneNumber && isPhoneChanged && !isPhoneVerified && !otpSent && (
                <span 
                  onClick={handleSendOtp}
                  style={{ color: '#000', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}
                >
                  Verify phone number
                </span>
              )}
            </label>
          </div>

          {otpSent && (
            <div className="profile-field-row" style={{ marginTop: '10px' }}>
              <label>
                Enter SMS OTP
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                  />
                  <button 
                    type="button" 
                    onClick={handleVerifyOtp}
                    style={{ minWidth: '80px', height: '42px', background: '#000', color: '#fff', borderRadius: '6px' }}
                  >
                    Verify
                  </button>
                </div>
              </label>
            </div>
          )}
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
            {status && (
              <span className={`profile-message ${statusType}`}>{status}</span>
            )}
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
