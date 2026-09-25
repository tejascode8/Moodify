import { useContext, useState } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    user,
    setUser,
    loading,
    setLoading,
    updateThemePreference,
    isRegistered,
    openAuthModal,
    closeAuthModal,
    requireAuth,
  } = context;
  const [authError, setAuthError] = useState(null);

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await register({ username, email, password });
      setUser(data.user);
      return data.user;
    } catch (error) {
      const msg = error?.message || "Registration failed. Please check your credentials.";
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await login({ email, password });
      setUser(data.user);
      return data.user;
    } catch (error) {
      const msg = error?.message || "Invalid email or password";
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    const demoUser = {
      id: "demo-user-123",
      username: "Guest Explorer",
      email: "guest@moodify.ai",
      isDemo: true,
    };
    setUser(demoUser);
    setLoading(false);
    return demoUser;
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    authError,
    setAuthError,
    handleRegister,
    handleLogin,
    handleDemoLogin,
    handleLogout,
    updateThemePreference,
    isRegistered,
    openAuthModal,
    closeAuthModal,
    requireAuth,
  };
};

