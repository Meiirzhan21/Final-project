package handlers

import (
	"booking-system/db"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetHotelByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hotelID := vars["id"]

	// Проверка формата ObjectID
	objID, err := primitive.ObjectIDFromHex(hotelID)
	if err != nil {
		http.Error(w, "Неверный формат ObjectId", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("hotels")
	var hotel bson.M
	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&hotel)
	if err != nil {
		http.Error(w, "Отель не найден", http.StatusNotFound)
		return
	}

	// Конвертация ObjectID и координат
	hotel["id"] = hotel["_id"].(primitive.ObjectID).Hex()
	if lat, ok := hotel["latitude"].(float64); ok {
		hotel["lat"] = lat
	}
	if lng, ok := hotel["longitude"].(float64); ok {
		hotel["lng"] = lng
	}

	// Удаляем лишние поля
	delete(hotel, "_id")
	delete(hotel, "latitude")
	delete(hotel, "longitude")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hotel)
	fmt.Println("Отправлен отель:", hotel)
}
