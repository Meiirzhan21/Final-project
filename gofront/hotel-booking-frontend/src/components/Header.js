"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white py-3">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link href="/">🏨 Hotel Booking</Link>
        </h1>
        <nav className="flex space-x-4">
          <Link href="/hotels" className="hover:underline">Поиск</Link>
          {isLoggedIn && (
            <>
              <Link href="/my-bookings" className="hover:underline">Мои бронирования</Link>
              <Link href="/profile" className="hover:underline">Личный кабинет</Link>
              <button onClick={logout} className="hover:underline">
                Выйти
              </button>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link href="/login" className="hover:underline">Вход</Link>
              <Link href="/register" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200 transition">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
