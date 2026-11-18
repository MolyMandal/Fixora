
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("fixoraUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("fixoraToken") || null;
  });

  // Register user
  const register = async (formData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  };

  // Login user
  const login = async (formData) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("fixoraToken", data.token);
    localStorage.setItem("fixoraUser", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  // Update logged-in user's profile
  const updateProfile = async (formData) => {
    if (!token) {
      throw new Error("Please login first.");
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Profile update failed");
    }

    localStorage.setItem("fixoraUser", JSON.stringify(data.user));
    setUser(data.user);

    return data;
  };

  // Change logged-in user's password
  const changePassword = async (formData) => {
    if (!token) {
      throw new Error("Please login first.");
    }

    const response = await fetch(`${API_URL}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password change failed");
    }

    return data;
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("fixoraToken");
    localStorage.removeItem("fixoraUser");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        register,
        login,
        updateProfile,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
