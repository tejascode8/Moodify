import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  withCredentials: true,
});

export async function register({ email, password, username }) {
  try {
    const response = await api.post("/api/auth/register", {
      email,
      password,
      username,
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: "Registration failed" };
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: "Invalid email or password" };
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    // 401 indicates guest/unauthenticated user on first load
    return { user: null };
  }
}

export async function logout() {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: "Logout failed" };
  }
}

export async function updateUserTheme(theme) {
  try {
    const response = await api.patch("/api/auth/theme", { theme });
    return response.data;
  } catch (error) {
    console.warn("Could not save theme preference to server:", error?.message);
    return null;
  }
}

export default api;
