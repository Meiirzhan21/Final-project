// db/db.go
package db

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectMongoDB() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Подключаемся к MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		return fmt.Errorf("ошибка подключения к MongoDB: %v", err)
	}

	// Проверяем подключение
	if err = client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("ошибка ping MongoDB: %v", err)
	}

	fmt.Println("✅ Успешное подключение к MongoDB")

	Client = client
	return nil
}

// GetCollection — возвращает коллекцию из базы
func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database("hotel_booking").Collection(collectionName)
}
