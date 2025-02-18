package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Ваш секретный ключ
var secretKey = []byte("your-secret-key")

// ParseToken парсит JWT токен и извлекает данные из него
func ParseToken(tokenString string) (jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token signing method")
		}
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	return claims, nil
}

// GenerateJWT генерирует JWT токен
func GenerateJWT(username, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"username": username,
		"role":     role,
		"exp":      expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}
