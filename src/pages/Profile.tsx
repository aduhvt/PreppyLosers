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
  const [addressBook, setAddressBook] = useState<AddressBook>(emptyAddressBook);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
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

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setStatus("");

      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/users/profile`,
        {
          name: name.trim(),
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

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Not available";

  return (
    <div className="profile-page" style={{ backgroundImage: `url(${profileBg})` }}>
      <div className="profile-shell">
        <header className="profile-header">
          <img src={logo} alt="Preppy Losers" className="profile-logo" />
          <p className="profile-kicker">Preppy Losers</p>
          <h1>Profile</h1>
          <div className="profile-status-pill">{user?.role || "user"}</div>
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
              <input value={user?.email || "Not added"} disabled />
            </label>
            <label>
              Phone number
              <input value={user?.phoneNumber || "Not added"} disabled />
            </label>
          </div>

          <div className="profile-field-row">
            <label>
              Joined
              <input value={joinedDate} disabled />
            </label>
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
