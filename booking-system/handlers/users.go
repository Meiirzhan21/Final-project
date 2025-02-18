package handlers

import (
	"booking-system/db"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// User — модель пользователя
type User struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	Username  string    `json:"username" bson:"username"`
	Password  string    `json:"password" bson:"password"`
	Role      string    `json:"role" bson:"role"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
}

// GetUsersHandler — Получаем список пользователей
func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("users")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Ошибка при получении пользователей", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var users []User
	if err := cursor.All(ctx, &users); err != nil {
		http.Error(w, "Ошибка при обработке данных", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
