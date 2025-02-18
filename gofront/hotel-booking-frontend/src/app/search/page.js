"use client";
import { useState } from "react";
import Link from "next/link";
import hotelData from "../../app/hotels/page"; 
export default function Search() {
  const [query, setQuery] = useState("");

  const filteredHotels = Object.keys(hotelData)
    .map((id) => ({ id, ...hotelData[id] }))
    .filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(query.toLowerCase()) ||
        hotel.city.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-6 text-black">Поиск отелей</h1>

      {/* Поле поиска */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Введите название или город..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 border rounded-lg text-black"
        />
      </div>

      {/* Список отелей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover"/>
              <div className="p-4">
                <h2 className="text-xl font-bold text-black">{hotel.name}</h2>
                <p className="text-black">{hotel.city}</p>
                <p className="text-lg font-semibold mt-2 text-black">${hotel.price} / ночь</p>
                <Link href={`/hotel/${hotel.id}`}>
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    Подробнее
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-3">Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}
