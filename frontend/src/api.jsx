import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL + "/api"
    : "http://localhost:5000/api",
});

export default API;
