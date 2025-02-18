// handlers/profile.go
package handlers

import (
	"booking-system/db"
	"booking-system/middleware"
	"booking-system/models"
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

// ProfileHandler — возвращает профиль пользователя
func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(middleware.UsernameKey).(string)
	if !ok {
		http.Error(w, "Ошибка: Не удалось получить имя пользователя", http.StatusUnauthorized)
		return
	}

	collection := db.GetCollection("users")

	// Ищем пользователя в MongoDB
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		http.Error(w, "Ошибка: Пользователь не найден", http.StatusNotFound)
		return
	}

	// Отправляем данные профиля
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username":  user.Username,
		"email":     user.Email,
		"createdAt": user.CreatedAt,
	})
}
