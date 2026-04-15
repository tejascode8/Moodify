import { login, register, getMe, logout } from "../services/auth.api";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  async function handleRegister({ username, email, password }) {
    try {
      setLoading(true);
      const data = await register({ username, email, password });
      setUser(data.user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin({ username, email, password }) {
    try {
      setLoading(true);
      const data = await login({ username, email, password });
      setUser(data.user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetMe() {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data.user);
    } catch (error) {
      setUser(null);
      // Only log if it's not a 401 "Token not provided" error
      // Note: auth.api.js throws error?.response?.data, not the full Axios error
      const errorMessage = error?.message || "";
      const isTokenNotFoundError =
        errorMessage === "Token not provided" ||
        errorMessage.includes("Token not provided") ||
        (error?.status === 401 && errorMessage === "Token not provided");

      if (!isTokenNotFoundError) {
        console.log("getMe failed:", errorMessage || error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleGetMe().catch(() => {
      setUser(null);
    });
  }, []);

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    handleGetMe,
  };
};
