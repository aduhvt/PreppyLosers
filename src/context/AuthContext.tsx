import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  addressBook?: {
    fullName: string;
    address: string;
    city: string;
    pincode: string;
    phone: string;
    country: string;
    apartment: string;
    phoneNumber?: string;
  };
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  login: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, login, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};