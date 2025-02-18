// main.go
package main

import (
	"booking-system/auth"
	"booking-system/db"
	"booking-system/handlers"
	"booking-system/middleware"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

// === Глобальные переменные ===
var users = map[string]string{}
var roles = map[string]string{}

// Инициализация: добавляем администратора при старте
func init() {
	adminPassword, _ := auth.HashPassword("admin123")
	users["admin"] = adminPassword
	roles["admin"] = "admin"
}

func main() {
	// === 🟢 Подключение к MongoDB ===
	if err := db.ConnectMongoDB(); err != nil {
		log.Fatalf("❌ Ошибка подключения к MongoDB: %v", err)
	}
	log.Println("✅ Подключено к MongoDB")

	// ✅ Создаем основной роутер
	router := mux.NewRouter()

	// ✅ Подключаем CORS Middleware
	corsRouter := middleware.CORSMiddleware(router)

	// ✅ Подключаем Rate Limiting
	limiter := middleware.NewRateLimiter(5, time.Minute)

	// === 📂 Публичные маршруты ===
	// === 📂 Публичные маршруты ===
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Добро пожаловать в систему бронирования отелей!"))
	}).Methods("GET")

	// ✅ Регистрация и ЛОГИН — должны быть ПУБЛИЧНЫМИ (Без /protected/)
	router.Handle("/register", limiter.Middleware(http.HandlerFunc(handlers.RegisterHandler))).Methods("POST")
	router.Handle("/login", limiter.Middleware(http.HandlerFunc(handlers.LoginHandler))).Methods("POST") // ✅ ПУБЛИЧНО!
	// ✅ Используем {id}, но он будет конвертирован в ObjectID
	router.Handle("/protected/bookings/{_id}", middleware.AuthMiddleware(
		http.HandlerFunc(handlers.DeleteBookingHandler),
	)).Methods("DELETE")

	// ✅ Публичные маршруты для отелей
	router.HandleFunc("/hotels", handlers.GetHotelsHandler).Methods("GET")
	router.HandleFunc("/users", handlers.GetUsersHandler).Methods("GET")
	router.Handle("/hotels/upload", http.HandlerFunc(handlers.AddHotelsHandler)).Methods("POST")
	// Добавить маршрут для получения отеля по ID
	router.HandleFunc("/hotels/{id}", handlers.GetHotelByIDHandler).Methods("GET")

	// === 📂 Защищённые маршруты ===
	protected := router.PathPrefix("/protected").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	// Получить отель по ID
	protected.HandleFunc("/hotels/{id}", handlers.GetHotelByIDHandler).Methods("GET")

	protected.Handle("/profile", http.HandlerFunc(handlers.ProfileHandler)).Methods("GET")

	protected.Handle("/bookings", http.HandlerFunc(handlers.BookingsHandler)).Methods("GET")
	protected.Handle("/bookings/add", http.HandlerFunc(handlers.AddBookingHandler)).Methods("POST")

	// ✅ Защищённые маршруты для отелей
	protected.Handle("/hotels", http.HandlerFunc(handlers.GetHotelsHandler)).Methods("GET")
	protected.Handle("/hotels/upload", http.HandlerFunc(handlers.AddHotelsHandler)).Methods("POST")
	protected.Handle("/hotels/clear", http.HandlerFunc(handlers.ClearHotelsHandler)).Methods("DELETE")

	// === 📂 Админ-панель ===
	protected.HandleFunc("/dashboard", func(w http.ResponseWriter, r *http.Request) {
		username, _ := r.Context().Value(middleware.UsernameKey).(string)
		role, _ := r.Context().Value(middleware.RoleKey).(string)

		if role != "admin" {
			http.Error(w, "Ошибка: Только для администратора", http.StatusForbidden)
			return
		}
		w.Write([]byte("Привет, " + username + "! Это панель администратора."))
	}).Methods("GET")

	// ✅ Проверочный эндпоинт
	protected.HandleFunc("/booking", func(w http.ResponseWriter, r *http.Request) {
		username, _ := r.Context().Value(middleware.UsernameKey).(string)
		w.Write([]byte("Здравствуйте, " + username + "! Здесь будет страница бронирования."))
	}).Methods("GET")

	// === 🏁 Запуск сервера ===
	log.Println("🚀 Сервер запущен на порту :8080")
	log.Fatal(http.ListenAndServe(":8080", corsRouter))
}
