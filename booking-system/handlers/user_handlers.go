package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"booking-system/auth"
	"booking-system/db"
	"booking-system/models"

	"go.mongodb.org/mongo-driver/bson"
)

// Временная база пользователей (сделана глобальной)
var users = map[string]string{}
var roles = map[string]string{}

// Инициализация (добавляем админа при старте)
func init() {
	adminPassword, _ := auth.HashPassword("admin123")
	users["admin"] = adminPassword
	roles["admin"] = "admin"
}

// Регистрация пользователя
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Ошибка в данных", http.StatusBadRequest)
		return
	}

	// ✅ Хешируем пароль перед сохранением
	hashedPassword, err := auth.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "Ошибка хеширования пароля", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword
	user.CreatedAt = time.Now()

	collection := db.GetCollection("users")

	// Вставка в MongoDB
	_, err = collection.InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "Ошибка при сохранении пользователя", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("✅ Пользователь зарегистрирован"))
}

// Вход пользователя
// Вход пользователя
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.User
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Ошибка чтения данных", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("users")

	// Находим пользователя по имени
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"username": creds.Username}).Decode(&user)
	if err != nil {
		http.Error(w, "Пользователь не найден", http.StatusUnauthorized)
		return
	}

	// ✅ Сравниваем хеши паролей
	if !auth.CheckPasswordHash(creds.Password, user.Password) {
		http.Error(w, "Неверный пароль", http.StatusUnauthorized)
		return
	}

	// ✅ Генерируем токен
	token, err := auth.GenerateJWT(user.Username, user.Role)
	if err != nil {
		http.Error(w, "Ошибка генерации токена", http.StatusInternalServerError)
		return
	}

	// ✅ Возвращаем token и user в одном ответе
	response := map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
