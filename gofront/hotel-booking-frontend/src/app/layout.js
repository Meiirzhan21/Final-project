// src/app/layout.js
"use client";

import "@/app/globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast"; // 📌 Уведомления
import Head from "next/head";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <Head>
        <title>Hotel Booking</title>
        <meta name="description" content="Система бронирования отелей" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/hotel-bg.jpg')" }}
      >
        {/* ✅ Провайдер авторизации */}
        <AuthProvider>
          {/* ✅ Компонент навигации */}
          <NavBar />

          {/* 📢 Компонент уведомлений */}
          <Toaster position="top-center" reverseOrder={false} />

          {/* ✅ Основной контент */}
          <main className="container mx-auto p-5 bg-white bg-opacity-95 rounded-lg shadow-lg mt-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
