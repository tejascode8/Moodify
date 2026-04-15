import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export async function getSong({ mood }) {
  const response = await api.get("/api/songs?mood=" + mood);
  //   console.log(response);
  return response.data;
}

// export async function getSong(mood) {
//   const res = await fetch(`http://localhost:3000/api/songs?mood=${mood}`);

//   return res.json();
// }
