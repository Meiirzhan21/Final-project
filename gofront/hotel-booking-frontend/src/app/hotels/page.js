"use client";

import Link from "next/link";
import publicApi from "@/utils/publicApi";
import { useEffect, useState } from "react";

const hotelData = {
  1: {
    name: "Rixos Almaty Hotel",
    city: "Алматы",
    price: 150,
    image: "/hotel-images/rixos.jpg",
    description: "Роскошный отель в центре Алматы с великолепными удобствами.",
    lat: 43.238949,
    lng: 76.889709,
  },
  2: {
    name: "Hilton Garden Inn Astana",
    city: "Астана",
    price: 120,
    image: "/hotel-images/hilton.jpg",
    description: "Современный отель в сердце столицы Казахстана.",
    lat: 51.169392,
    lng: 71.449074,
  },
  3: {
    name: "Rixos Water World Aktau",
    city: "Актау",
    price: 200,
    image: "/hotel-images/rixos_aktau.jpg",
    description: "Пятизвездочный курорт на побережье Каспийского моря.",
    lat: 43.65,
    lng: 51.15,
  },
  4: {
    name: "Отель Казахстан",
    city: "Алматы",
    price: 100,
    image: "/hotel-images/Отель Казахстан.jpg",
    description: "Знаковый отель с панорамным видом на город.",
    lat: 43.25667,
    lng: 76.95323,
  },
  5: {
    name: "Rixos Borovoe Hotel",
    city: "Боровое",
    price: 180,
    image: "/hotel-images/Rixos Borovoe Hotel.jpeg",
    description: "Элегантный отель на берегу озера Щучье.",
    lat: 53.091667,
    lng: 70.307778,
  },
  6: {
    name: "The Ritz-Carlton, Almaty",
    city: "Алматы",
    price: 220,
    image: "/hotel-images/The Ritz-Carlton Almaty.jpg",
    description: "Роскошный отель с потрясающим видом на горы Заилийского Алатау.",
    lat: 43.222015,
    lng: 76.851248,
  },
  7: {
    name: "InterContinental Almaty",
    city: "Алматы",
    price: 190,
    image: "/hotel-images/InterContinental Almaty.jpg",
    description: "Пятизвездочный отель рядом с президентским дворцом.",
    lat: 43.235546,
    lng: 76.909392,
  },
  8: {
    name: "Marriott Astana Hotel",
    city: "Астана",
    price: 160,
    image: "/hotel-images/Marriott Astana Hotel.webp",
    description: "Современный отель в деловом центре Астаны.",
    lat: 51.128891,
    lng: 71.430298,
  },
  9: {
    name: "Sheraton Nur-Sultan Hotel",
    city: "Астана",
    price: 170,
    image: "/hotel-images/Sheraton Nur-Sultan Hotel.jpg",
    description: "Элегантный отель с современными удобствами в центре города.",
    lat: 51.124218,
    lng: 71.430411,
  },
  10: {
    name: "DoubleTree by Hilton Shymkent",
    city: "Шымкент",
    price: 140,
    image: "/hotel-images/DoubleTree by Hilton Shymkent.jpg",
    description: "Комфортабельный отель с отличным сервисом в Шымкенте.",
    lat: 42.34172,
    lng: 69.5901,
  },
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 📌 Загружаем отели через публичный API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await publicApi.get("/hotels"); // ✅ Публичный маршрут
        setHotels(response.data || []);
      } catch (error) {
        setError("Ошибка при загрузке списка отелей.");
        console.error("Ошибка при загрузке отелей:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-black text-center mb-8">🏨 Отели</h1>

      {hotels.length === 0 ? (
        <p className="text-center text-gray-600">Отели не найдены.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Link 
              key={hotel.id} 
              href={`/hotel/${hotel.id}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border cursor-pointer hover:shadow-xl transition">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-52 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold text-black">{hotel.name}</h2>
                  <p className="text-gray-600">📍 {hotel.city}</p>
                  <p className="text-lg font-semibold text-black">💰 ${hotel.price} / ночь</p>
                  <p className="text-sm text-gray-500 mt-2">{hotel.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
