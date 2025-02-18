package middleware

import (
	"net/http"
	"sync"
	"time"
)

// RateLimiter - ограничение частоты запросов
type RateLimiter struct {
	mu        sync.Mutex
	tokens    map[string]int
	lastCheck map[string]time.Time
	limit     int
	window    time.Duration
}

// NewRateLimiter создает лимитер
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		tokens:    make(map[string]int),
		lastCheck: make(map[string]time.Time),
		limit:     limit,
		window:    window,
	}
}

// Middleware для ограничения запросов
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		rl.mu.Lock()
		defer rl.mu.Unlock()

		// Проверяем, прошло ли окно времени
		if last, ok := rl.lastCheck[ip]; ok && time.Since(last) > rl.window {
			rl.tokens[ip] = 0
			rl.lastCheck[ip] = time.Now()
		}

		// Проверяем лимит
		if rl.tokens[ip] >= rl.limit {
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		// Увеличиваем счетчик запросов
		rl.tokens[ip]++
		rl.lastCheck[ip] = time.Now()

		next.ServeHTTP(w, r)
	})
}
