import axios from "axios";

// Set VITE_API_URL (e.g. in a .env.local file or in Vercel) to point at another backend.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://barberpro-backend-nv11.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export default API;
