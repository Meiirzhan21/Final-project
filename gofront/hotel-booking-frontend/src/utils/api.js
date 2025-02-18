import axios from "axios";

// =========================================
// 🌐 Публичный API — без авторизации
// Используется для: /register, /login
// =========================================
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ✅ Вход пользователя (логин)
export const loginUser = async (credentials) => {
  try {
    const response = await publicApi.post("/login", credentials);
    return response.data; // { token, user }
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при входе";
  }
};

// ✅ Регистрация пользователя
export const registerUser = async (userData) => {
  try {
    const response = await publicApi.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при регистрации";
  }
};

// =========================================
// 🔒 Защищённый API — с авторизацией
// Используется для: /profile, /bookings, /protected/hotels
// =========================================
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/protected`
    : "http://localhost:8080/protected",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ✅ Автоматически добавляем токен из localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Глобальная обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      alert("⏳ Сессия истекла. Войдите снова.");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    } else if (status === 403) {
      alert("🚫 У вас нет доступа к этому ресурсу.");
    } else if (status >= 500) {
      alert("💥 Ошибка сервера. Попробуйте позже.");
    }

    return Promise.reject(error.response?.data || "❌ Ошибка запроса");
  }
);

// =========================================
// 🏨 Отели
// =========================================

// ✅ Получение одного отеля по ObjectId
export const getHotelById = async (id) => {
  try {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Отель не найден";
  }
};

// ✅ Получение всех отелей
export const getHotels = async () => {
  try {
    const response = await api.get("/hotels");
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при загрузке отелей";
  }
};

// ✅ Очистка всех отелей (для администратора)
export const clearHotels = async () => {
  try {
    const response = await api.delete("/hotels/clear");
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при очистке отелей";
  }
};

// =========================================
// 🏨 Бронирования
// =========================================

// ✅ Получение всех бронирований текущего пользователя
// ✅ Получение всех бронирований текущего пользователя
export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings");
    const data = response.data;

    // ✅ Гарантируем, что всегда будет массив
    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn("Получен неожиданный формат:", data);
      return [];
    }
  } catch (error) {
    console.error("Ошибка загрузки бронирований:", error);
    return [];
  }
};


// ✅ Добавление бронирования
export const addBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings/add", bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при бронировании";
  }
};


// ✅ Удаление бронирования по _id
export const deleteBooking = async (bookingId) => {
  try {
    if (!bookingId || typeof bookingId !== "string") {
      throw new Error("❌ Невалидный ObjectID");
    }
    const response = await api.delete(`/bookings/${bookingId}`);
    return response;
  } catch (error) {
    console.error("Ошибка при удалении бронирования:", error.response?.data || error);
    throw error.response?.data || "❌ Ошибка при удалении";
  }
};




// ✅ Оплата бронирования
export const payForBooking = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/pay`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при оплате бронирования";
  }
};

// =========================================
// 👤 Пользователь
// =========================================

// ✅ Получение профиля пользователя
export const getUserProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || "❌ Ошибка при получении профиля";
  }
};

export default api;
