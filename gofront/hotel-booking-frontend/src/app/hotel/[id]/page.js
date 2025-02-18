"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import Map from "@/components/Map";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function HotelPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 📌 Проверяем валидность ObjectId
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  // 📌 Загружаем данные отеля по ID
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        if (!isValidObjectId(id)) {
          throw new Error("Неверный формат ObjectId");
        }
        const response = await api.get(`/hotels/${id}`);
        setHotel(response.data);
      } catch (err) {
        setError("Отель не найден");
        console.error("Ошибка загрузки отеля:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchHotel();
    }
  }, [id]);

  // 📌 Рассчитываем общую стоимость
  const calculateTotalPrice = (checkIn, checkOut) => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
      return nights * (hotel?.price || 0);
    }
    return 0;
  };

  // 📌 Функция бронирования
  const handleBooking = async () => {
    if (!isLoggedIn) {
      alert("Вы не вошли в аккаунт! Пожалуйста, авторизуйтесь перед бронированием.");
      router.push("/login");
      return;
    }
  
    if (!checkIn || !checkOut) {
      alert("Выберите даты заезда и выезда!");
      return;
    }
  
    const total = calculateTotalPrice(checkIn, checkOut);
    const bookingData = {
      hotel_name: hotel.name,
      city: hotel.city,
      check_in: checkIn.toISOString().split("T")[0],
      check_out: checkOut.toISOString().split("T")[0],
      price_per_night: hotel.price,
      total_price: total,
      paid: false,
    };
  
    console.log("📤 Отправка данных бронирования:", bookingData); // 📌 Логируем данные
  
    try {
      const response = await api.post("/bookings/add", bookingData);
      alert(`✅ Бронирование успешно: ${response.data.message}`);
      router.push("/my-bookings"); // Вместо "/my-bookings"

    } catch (error) {
      console.error("Ошибка при бронировании:", error.response?.data || error);
      alert("❌ Ошибка при бронировании: " + (error.response?.data?.error || "Ошибка сервера"));
    }
  };

  if (loading) return <p className="text-center text-gray-500">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <img src={hotel.image} alt={hotel.name} className="w-full h-96 object-cover" />
        <div className="p-6">
          <h1 className="text-4xl font-bold text-black">{hotel.name}</h1>
          <p className="text-lg text-black">{hotel.city}</p>
          <p className="mt-4 text-lg text-black">{hotel.description}</p>
          <p className="text-2xl font-bold mt-4 text-black">${hotel.price} / ночь</p>

          {/* 📅 Форма бронирования */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2 text-black">Выберите даты</h2>

            <label className="block text-black">📅 Дата заезда:</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                setTotalPrice(calculateTotalPrice(date, checkOut));
              }}
              dateFormat="dd.MM.yyyy"
              minDate={new Date()}
              className="w-full p-2 border rounded mt-2 text-black bg-white cursor-pointer"
            />

            <label className="block mt-4 text-black">📅 Дата выезда:</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => {
                setCheckOut(date);
                setTotalPrice(calculateTotalPrice(checkIn, date));
              }}
              dateFormat="dd.MM.yyyy"
              minDate={checkIn || new Date()}
              className="w-full p-2 border rounded mt-2 text-black bg-white cursor-pointer"
            />

            <p className="mt-4 text-lg font-semibold text-black">💰 Итого: ${totalPrice || 0}</p>

            <button
              onClick={handleBooking}
              className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Забронировать
            </button>
          </div>

          {/* 🗺️ Карта с расположением */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2 text-black">🗺️ Расположение отеля</h2>
            <Map
              lat={hotel.lat ?? 0}
              lng={hotel.lng ?? 0}
              name={hotel.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
