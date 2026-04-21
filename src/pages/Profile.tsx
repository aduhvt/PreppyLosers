import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/users/profile`,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Profile updated successfully 🔥");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  return (
    <div style={styles.container}>
      <h1>My Profile</h1>

      <div style={styles.card}>
        <label>Email</label>
        <input value={user?.email || ""} disabled style={styles.input} />

        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button} onClick={updateProfile}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

const styles: any = {
  container: {
    padding: "60px",
    background: "#0e0e0e",
    color: "white",
    minHeight: "100vh",
  },
  card: {
    background: "#151515",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#222",
    color: "white",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    background: "white",
    color: "black",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Profile;