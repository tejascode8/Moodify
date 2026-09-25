import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  withCredentials: true,
});

export async function getSong({ mood }) {
  try {
    const response = await api.get(`/api/songs?mood=${mood || "happy"}`);
    return response.data;
  } catch (err) {
    console.warn("API getSong warning, falling back to local dataset:", err.message);
    throw err;
  }
}

export async function getAllSongs() {
  try {
    const response = await api.get("/api/songs");
    return response.data;
  } catch (err) {
    console.warn("API getAllSongs warning:", err.message);
    throw err;
  }
}

export async function deleteSong(id) {
  try {
    const response = await api.delete(`/api/songs/${id}`);
    return response.data;
  } catch (err) {
    console.warn("API deleteSong warning:", err.message);
    throw err;
  }
}

export default api;

