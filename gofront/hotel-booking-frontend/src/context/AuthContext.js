"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

const AuthContext = createContext();

// ✅ Провайдер авторизации
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📌 Читаем токен и пользователя из localStorage при запуске
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("currentUser");

      console.log("Stored Token: ", storedToken); // Логируем значение токена
      console.log("Stored User: ", storedUser);   // Логируем значение пользователя

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Parsed User: ", parsedUser); // Логируем распарсенные данные пользователя

          if (parsedUser) {
            setToken(storedToken);
            setUser(parsedUser);
            setIsLoggedIn(true);
          } else {
            console.error("Parsed user is null or invalid.");
          }
        } catch (error) {
          console.error("Ошибка парсинга пользователя:", error);
        }
      }
    } catch (error) {
      console.error("Ошибка чтения данных из localStorage:", error);
      localStorage.removeItem("currentUser"); // Удаляем некорректные данные
    }

    setLoading(false);

    // 🟡 Следим за изменениями localStorage (на случай действий из другого окна)
    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("token");
      const updatedUser = localStorage.getItem("currentUser");

      console.log("Updated Token: ", updatedToken); // Логируем обновленный токен
      console.log("Updated User: ", updatedUser);   // Логируем обновленный пользователь

      if (updatedToken && updatedUser) {
        try {
          const parsedUser = JSON.parse(updatedUser);
          console.log("Parsed Updated User: ", parsedUser); // Логируем распарсенные обновленные данные пользователя

          if (parsedUser) {
            setToken(updatedToken);
            setUser(parsedUser);
            setIsLoggedIn(true);
          } else {
            console.error("Parsed updated user is null or invalid.");
            setIsLoggedIn(false); // Сброс состояния
          }
        } catch {
          console.error("Ошибка парсинга данных из localStorage");
          localStorage.removeItem("currentUser");
          setIsLoggedIn(false);
        }
      } else {
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Функция входа
  // ✅ Исправленная функция login:
const login = (token, user) => {
  if (!token || !user || typeof user !== "object") {
    console.error("Invalid login data", token, user);
    return;
  }

  // ✅ Сохраняем данные правильно
  localStorage.setItem("token", token);
  localStorage.setItem("currentUser", JSON.stringify(user));

  console.log("User saved to localStorage:", token, user);
  setToken(token);
  setUser(user);
  setIsLoggedIn(true);
  router.push("/profile");
};


  // ❌ Функция выхода
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    router.push("/login"); // Перенаправляем на страницу входа
  };

  // ✅ Получаем текущие данные профиля
  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      setUser(response.data);
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      logout(); // Если ошибка, выходим из аккаунта
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        login,
        logout,
        fetchProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
