import axios from "axios";
import { readJSON } from "../utils/storage";

// Set VITE_API_URL (e.g. in a .env.local file or in Vercel) to point at another backend.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://barberpro-backend-nv11.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const user = readJSON("user");
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;
