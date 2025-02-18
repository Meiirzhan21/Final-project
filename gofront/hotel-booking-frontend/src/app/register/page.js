// src/app/register/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/utils/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    setMessage("");

    // 🔎 Валидация
    if (!email || !username || !password || !confirmPassword) {
      setError("❌ Заполните все поля.");
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Пароли не совпадают.");
      return;
    }

    try {
      // 📤 Отправляем данные на регистрацию
      const response = await registerUser({
        email,
        username,
        password,
      });

      setMessage("✅ Регистрация успешна! Перенаправляем на вход...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("❌ Ошибка при регистрации: " + err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          📝 Регистрация
        </h1>

        {message && (
          <p className="text-center text-green-600 mb-4">{message}</p>
        )}
        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            📧 Почта
          </label>
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mt-1 text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            👤 Имя пользователя
          </label>
          <input
            type="text"
            placeholder="Ваше имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mt-1 text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            🔑 Пароль
          </label>
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mt-1 text-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            🗝️ Подтвердите пароль
          </label>
          <input
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded mt-1 text-black"
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          🚀 Зарегистрироваться
        </button>
      </div>
    </div>
  );
}
