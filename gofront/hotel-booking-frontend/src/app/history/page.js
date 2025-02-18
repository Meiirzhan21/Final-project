"use client";
import { useEffect, useState } from "react";

export default function History() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
    
    const storedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const paidBookings = storedBookings.filter(booking => booking.paid);
    setHistory(paidBookings);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">История бронирований</h1>

      {user ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mt-6 text-black">Оплаченные бронирования</h2>
          {history.length === 0 ? (
            <p className="text-gray-600">У вас нет оплаченных бронирований.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 mt-4">
              {history.map((booking, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-4">
                  <h2 className="text-xl font-bold text-black">{booking.name}</h2>
                  <p className="text-black">{booking.city}</p>
                  <p className="text-black">Заезд: {booking.checkIn}</p>
                  <p className="text-black">Выезд: {booking.checkOut}</p>
                  <p className="text-lg font-semibold mt-2 text-black">Цена за ночь: ${booking.pricePerNight}</p>
                  <p className="text-lg font-bold mt-2 text-black">Итого: ${booking.totalPrice}</p>
                  <p className="text-green-600 font-bold mt-4 flex items-center">✅ Оплачено</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-600">Вы не вошли в систему.</p>
      )}
    </div>
  );
}
