// src/app/hotels/uploadHotels.js
"use client";
import api from "@/utils/api";

const uploadHotels = async (hotelData) => {
  try {
    const hotelsArray = Object.keys(hotelData).map((key) => ({
      id: key,
      ...hotelData[key],
    }));

    // Отправляем массив отелей на сервер
    const response = await api.post("/hotels/upload", {
        hotels: hotelsArray,
      });
      

    console.log("✅ Отели успешно загружены:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка при загрузке отелей:", error.response?.data || error.message);
    throw error;
  }
};

export default uploadHotels;
