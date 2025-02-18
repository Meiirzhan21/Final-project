"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyBookings, deleteBooking } from "@/utils/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isProcessing = useRef(false);

  // 📌 Получаем бронирования с сервера
  useEffect(() => {
    if (!isLoggedIn) {
      alert("Вы не вошли в аккаунт!");
      router.replace("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.error("Ошибка: Неверный формат бронирований:", data);
          setBookings([]);
        }
      } catch (error) {
        console.error("Ошибка загрузки бронирований:", error);
        alert("Ошибка при загрузке бронирований.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isLoggedIn, router]);

  // 📌 Проверяем успешную оплату после возврата
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") === "true" && query.get("bookingId")) {
      const bookingId = query.get("bookingId");

      if (!isProcessing.current) {
        isProcessing.current = true;

        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b._id === bookingId ? { ...b, paid: true } : b
          )
        );

        setAlertMessage("✅ Оплата успешно завершена!");

        setTimeout(() => {
          setAlertMessage("");
          router.replace("/my-bookings");
          isProcessing.current = false;
        }, 3000);
      }
    }
  }, [router]);

  // 📌 Обработка удаления бронирования
  const handleDeleteBooking = async (bookingId) => {
    try {
      if (!bookingId) {
        alert("❌ Невалидный ID бронирования!");
        return;
      }
  
      const confirmDelete = window.confirm(
        "Вы уверены, что хотите удалить это бронирование?"
      );
      if (!confirmDelete) return;
  
      // Приводим ObjectId к строке
      const id = typeof bookingId === "object" ? bookingId.toString() : bookingId;
  
      const response = await deleteBooking(id);
  
      if (response && response.status === 200) {
        setBookings((prev) =>
          Array.isArray(prev)
            ? prev.filter((booking) => booking._id !== bookingId)
            : []
        );
        alert("✅ Бронирование успешно удалено.");
      } else {
        throw new Error("Ошибка при удалении бронирования.");
      }
    } catch (error) {
      console.error("Ошибка при удалении бронирования:", error);
      alert("❌ Не удалось удалить бронирование. Попробуйте позже.");
    }
  };
  

  if (loading) {
    return (
      <p className="text-center text-gray-600">
        ⏳ Загрузка ваших бронирований...
      </p>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Всплывающее уведомление */}
      {alertMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white py-3 px-6 rounded">
          {alertMessage}
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-6 text-black">
        🛎️ Мои бронирования
      </h1>

      {Array.isArray(bookings) && bookings.length === 0 ? (
        <p className="text-center text-gray-600">
          У вас нет активных бронирований.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(bookings) &&
            bookings.map((booking, index) => (
              <div
                key={booking._id || `booking-${index}`} // ✅ Уникальный ключ для React
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
              >
                <h2 className="text-xl font-bold text-black">
                  🏨 {booking.hotel_name || "Отель"}
                </h2>
                <p className="text-gray-600">📍 {booking.city || "Город"}</p>
                <p className="text-sm text-black">
                  📅 Заезд: {booking.check_in || "N/A"} — Выезд:{" "}
                  {booking.check_out || "N/A"}
                </p>
                <p className="text-lg font-semibold mt-2 text-black">
                  💸 Цена за ночь: ${booking.price_per_night || "0.00"}
                </p>
                <p className="text-lg font-bold mt-2 text-green-600">
                  💰 Итого: ${booking.total_price || "0.00"}
                </p>

                {booking.paid ? (
                  <p className="text-green-500 font-bold mt-4 flex items-center">
                    ✅ Оплачено
                  </p>
                ) : (
                  <p className="text-red-500 font-bold mt-4 flex items-center">
                    ❌ Не оплачено
                  </p>
                )}

                {/* Кнопка удаления бронирования */}
                // ✅ Фронтенд: Используем корректный _id
                // ✅ Фронтенд: Используем _id из MongoDB
                <button
                onClick={() => handleDeleteBooking(booking._id)}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
                  🗑 Удалить бронирование
                  </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
