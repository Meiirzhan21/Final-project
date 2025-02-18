// handlers/hotels.go
package handlers

import (
	"booking-system/db"
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Hotel — модель отеля
type Hotel struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	City        string  `json:"city"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
	Image       string  `json:"image"`
}

var hotels = []Hotel{}
var hotelMutex sync.Mutex

// GetHotelsHandler — Получить список отелей из базы
func GetHotelsHandler(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("hotels")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Ошибка при получении отелей", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var hotels []bson.M
	if err := cursor.All(ctx, &hotels); err != nil {
		http.Error(w, "Ошибка при обработке данных", http.StatusInternalServerError)
		return
	}

	// Конвертируем ObjectID в строку
	// Конвертация `latitude`, `longitude` → `lat`, `lng`
	for i := range hotels {
		if id, ok := hotels[i]["_id"].(primitive.ObjectID); ok {
			hotels[i]["id"] = id.Hex()
		}
		if lat, ok := hotels[i]["latitude"].(float64); ok {
			hotels[i]["lat"] = lat
		}
		if lng, ok := hotels[i]["longitude"].(float64); ok {
			hotels[i]["lng"] = lng
		}
		delete(hotels[i], "latitude")
		delete(hotels[i], "longitude")
		delete(hotels[i], "_id")
	}

	if len(hotels) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Отелей пока нет",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hotels)
}

// AddHotelsHandler — добавляет список отелей в MongoDB
func AddHotelsHandler(w http.ResponseWriter, r *http.Request) {
	var newHotels []Hotel
	if err := json.NewDecoder(r.Body).Decode(&newHotels); err != nil {
		http.Error(w, "Ошибка при разборе данных", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("hotels")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Преобразуем отели в BSON
	var docs []interface{}
	for _, hotel := range newHotels {
		docs = append(docs, bson.M{
			"name":        hotel.Name,
			"city":        hotel.City,
			"price":       hotel.Price,
			"description": hotel.Description,
			"lat":         hotel.Lat,
			"lng":         hotel.Lng,
			"image":       hotel.Image,
		})
	}

	_, err := collection.InsertMany(ctx, docs)
	if err != nil {
		http.Error(w, "Ошибка при добавлении отелей", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Отели успешно добавлены",
	})
}

// ClearHotelsHandler — удаляет все отели из MongoDB (для тестов)
func ClearHotelsHandler(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("hotels")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.DeleteMany(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Ошибка при очистке базы", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "🚫 Все отели удалены из базы",
	})
}
