// src/utils/publicApi.js
import axios from "axios";

// ✅ Публичный API без авторизации
const publicApi = axios.create({
  baseURL: "http://localhost:8080", // Публичный адрес
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default publicApi;
