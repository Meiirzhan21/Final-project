"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div 
      className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/hotel-bg.jpg')" }}
    >
      {/* Затемнение фона для лучшей читаемости текста */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Контент по центру */}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
          Найдите идеальный отель
        </h1>
        <p className="text-lg md:text-xl mt-4 opacity-90">
          Бронируйте лучшие отели по всему миру
        </p>

        <Link href="/search">
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg">
            🔍 Найти отель
          </button>
        </Link>
      </div>
    </div>
  );
}
