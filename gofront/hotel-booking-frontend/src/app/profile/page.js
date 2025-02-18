"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // ✅ Получаем данные профиля
        const profileResponse = await api.get("/profile");
        console.log("✅ Профиль:", profileResponse.data);
        setUser(profileResponse.data);

        // ✅ Получаем бронирования
        const bookingsResponse = await api.get("/bookings");
        console.log("✅ Бронирования:", bookingsResponse.data);

        // 📌 Убедимся, что пришёл массив
        if (Array.isArray(bookingsResponse.data)) {
          setBookings(bookingsResponse.data);
        } else {
          console.warn("⚠️ Неверный формат бронирований:", bookingsResponse.data);
          setBookings([]);
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки данных:", err);
        setError("Ошибка при загрузке профиля");
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  if (loading) {
    return <p className="text-center text-gray-500">Загрузка...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">👤 Личный кабинет</h1>

      {/* 📌 Данные пользователя */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-black mb-4">👤 Профиль</h2>
          <p className="text-lg text-black"><strong>Имя:</strong> {user.username}</p>
          <p className="text-lg text-black"><strong>Роль:</strong> {user.role || "Пользователь"}</p>
          <p className="text-lg text-black"><strong>Дата регистрации:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      {/* 📌 Секция бронирований */}
      <h2 className="text-2xl font-bold mt-6 text-black">📑 Мои бронирования</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600">У вас пока нет бронирований.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {bookings.map((booking, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4 border">
              <h3 className="text-lg font-bold text-black">{booking.hotel_name}</h3>
              <p className="text-black">📍 Город: {booking.city || "Не указан"}</p>
              <p className="text-black">📅 Заезд: {new Date(booking.check_in).toLocaleDateString()}</p>
              <p className="text-black">📅 Выезд: {new Date(booking.check_out).toLocaleDateString()}</p>
              <p className="text-lg font-semibold mt-2 text-black">
                💰 Цена за ночь: ${booking.price_per_night?.toFixed(2) || "—"}
              </p>
              <p className="text-lg font-bold mt-2 text-black">
                💳 Итого: ${booking.total_price?.toFixed(2) || "—"}
              </p>
              {booking.paid ? (
                <p className="text-green-600 font-bold mt-4">✅ Оплачено</p>
              ) : (
                <p className="text-red-500 font-bold mt-4">❌ Не оплачено</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
