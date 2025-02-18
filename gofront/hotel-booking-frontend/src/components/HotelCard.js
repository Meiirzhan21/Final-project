"use client";
import api from "@/utils/api";
import { useState } from "react";

const HotelCard = ({ hotel }) => {
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const response = await api.post("/protected/bookings/add", {
        hotel_name: hotel.name,
        city: hotel.city,
        check_in: hotel.checkIn,
        check_out: hotel.checkOut,
        price_per_night: hotel.pricePerNight,
        total_price: hotel.totalPrice,
        paid: hotel.paid,
      });
      alert(`✅ ${response.data.message}`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Ошибка: Вы не авторизованы. Пожалуйста, войдите в аккаунт.");
      } else {
        alert(`Ошибка при бронировании: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold">{hotel.name}</h2>
      <p>📍 {hotel.city}</p>
      <p>💰 {hotel.pricePerNight} $/ночь</p>
      <p>📅 С {hotel.checkIn} по {hotel.checkOut}</p>
      <button
        onClick={handleBooking}
        disabled={loading}
        className={`mt-4 w-full py-2 rounded ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {loading ? "Бронирование..." : "Забронировать"}
      </button>
    </div>
  );
};

export default HotelCard;
