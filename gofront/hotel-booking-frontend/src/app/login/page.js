// src/app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { publicApi } from "@/utils/api";
import { toast } from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  // 📌 Обработка входа
  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("⚠️ Заполните все поля!");
      return;
    }

    try {
      const response = await publicApi.post("/login", { username, password });
      const { token, user } = response.data;

      // ✅ Передаем в контекст авторизации
      login(token, user);

      toast.success(`✅ Вход успешен как ${user.role}`);
      router.push("/profile");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "❌ Ошибка при входе";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // 📌 Обработка нажатия Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          🔐 Вход
        </h1>
        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* 👤 Имя пользователя */}
        <div className="mb-4">
          <label className="block text-gray-700">👤 Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя"
            className="w-full p-2 border rounded mt-1 text-black"
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* 🔑 Пароль */}
        <div className="mb-4">
          <label className="block text-gray-700">🔑 Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full p-2 border rounded mt-1 text-black"
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* 🚀 Кнопка входа */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          🚀 Войти
        </button>

        {/* 📌 Ссылка на регистрацию */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Нет аккаунта?{" "}
          <a
            href="/register"
            className="text-blue-500 hover:underline font-semibold"
          >
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}
