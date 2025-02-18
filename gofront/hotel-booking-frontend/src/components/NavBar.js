"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { isLoggedIn, logout } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);

  // ✅ Следим за изменениями в `isLoggedIn`
  useEffect(() => {
    setAuthenticated(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <header className="bg-blue-600 text-white py-3">
      <div className="container mx-auto flex justify-between items-center">
        {/* ✅ Логотип */}
        <h1 className="text-2xl font-bold">
          <Link href="/">🏨 Hotel Booking</Link>
        </h1>

        {/* ✅ Навигация */}
        <nav className="flex space-x-4">
          {/* 🏨 Отели (Доступно всегда) */}
          <Link href="/hotels" className="hover:underline font-semibold">
            Отели
          </Link>

          {/* 🔒 Если пользователь авторизован */}
          {authenticated ? (
            <>
              <Link href="/profile" className="hover:underline">
                Личный кабинет
              </Link>
              <Link href="/my-bookings" className="hover:underline">
                Мои бронирования
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              {/* 🔓 Если пользователь НЕ авторизован */}
              <Link href="/login" className="hover:underline">
                Вход
              </Link>
              <Link
                href="/register"
                className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200 transition"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
