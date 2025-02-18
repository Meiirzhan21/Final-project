// handlers/bookings.go
package handlers

import (
	"booking-system/db"
	"booking-system/middleware"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Booking — модель бронирования с ObjectID
type Booking struct {
	ID            primitive.ObjectID `json:"_id" bson:"_id"`
	Username      string             `json:"username"`
	HotelName     string             `json:"hotel_name"`
	City          string             `json:"city"`
	CheckIn       string             `json:"check_in"`
	CheckOut      string             `json:"check_out"`
	PricePerNight float64            `json:"price_per_night"`
	TotalPrice    float64            `json:"total_price"`
	Paid          bool               `json:"paid"`
	CreatedAt     string             `json:"created_at"`
}

// AddBookingRequest — структура запроса для добавления бронирования
type AddBookingRequest struct {
	HotelName     string  `json:"hotel_name"`
	City          string  `json:"city"`
	CheckIn       string  `json:"check_in"`
	CheckOut      string  `json:"check_out"`
	PricePerNight float64 `json:"price_per_night"`
	TotalPrice    float64 `json:"total_price"`
	Paid          bool    `json:"paid"`
}

// ✅ AddBookingHandler — добавляет новое бронирование в MongoDB
func AddBookingHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(middleware.UsernameKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req AddBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		log.Println("Ошибка запроса:", err)
		return
	}

	newBooking := Booking{
		ID:            primitive.NewObjectID(),
		Username:      username,
		HotelName:     req.HotelName,
		City:          req.City,
		CheckIn:       req.CheckIn,
		CheckOut:      req.CheckOut,
		PricePerNight: req.PricePerNight,
		TotalPrice:    req.TotalPrice,
		Paid:          req.Paid,
		CreatedAt:     time.Now().Format(time.RFC3339),
	}

	collection := db.GetCollection("bookings")
	_, err := collection.InsertOne(context.Background(), newBooking)
	if err != nil {
		http.Error(w, "Ошибка добавления в базу", http.StatusInternalServerError)
		log.Println("Ошибка добавления в MongoDB:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":    "✅ Бронирование успешно создано",
		"booking_id": newBooking.ID.Hex(),
	})
}

// ✅ BookingsHandler — возвращает бронирования текущего пользователя
func BookingsHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(middleware.UsernameKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	collection := db.GetCollection("bookings")
	cursor, err := collection.Find(context.Background(), bson.M{"username": username})
	if err != nil {
		http.Error(w, "Ошибка при получении данных", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var userBookings []Booking
	if err := cursor.All(context.Background(), &userBookings); err != nil {
		http.Error(w, "Ошибка обработки данных", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userBookings) // Всегда массив
}

// ✅ DeleteBookingHandler — удаляет бронирование по ObjectID
func DeleteBookingHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookingID := vars["id"] // Используем "id" из маршрута

	objID, err := primitive.ObjectIDFromHex(bookingID)
	if err != nil {
		http.Error(w, "❌ Невалидный ObjectID", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("bookings")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Ошибка удаления из базы", http.StatusInternalServerError)
		log.Println("Ошибка удаления из MongoDB:", err)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "❌ Бронирование не найдено", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "✅ Бронирование успешно удалено",
	})
}
