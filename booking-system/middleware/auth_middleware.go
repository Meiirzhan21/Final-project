// middleware/auth_middleware.go
package middleware

import (
	"booking-system/auth"
	"context"
	"log"
	"net/http"
	"strings"
)

// Определяем кастомные типы ключей для контекста
type contextKey string

const (
	UsernameKey contextKey = "username"
	RoleKey     contextKey = "role"
)

// CORSMiddleware добавляет заголовки для поддержки CORS
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Адрес фронтенда
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// AuthMiddleware проверяет JWT-токен
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		log.Printf("Authorization Header: %s", authHeader) // 📌 Логируем заголовок

		if authHeader == "" {
			http.Error(w, "Unauthorized: Missing Authorization header", http.StatusUnauthorized)
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized: Invalid token format", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := auth.ParseToken(tokenString)
		if err != nil {
			log.Printf("Ошибка авторизации: %v", err)
			http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
			return
		}

		username, ok := claims["username"].(string)
		if !ok {
			http.Error(w, "Unauthorized: Username not found in token", http.StatusUnauthorized)
			return
		}
		role, ok := claims["role"].(string)
		if !ok {
			http.Error(w, "Unauthorized: Role not found in token", http.StatusUnauthorized)
			return
		}

		log.Printf("✅ Пользователь авторизован: %s с ролью %s", username, role)
		ctx := context.WithValue(r.Context(), UsernameKey, username)
		ctx = context.WithValue(ctx, RoleKey, role)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
