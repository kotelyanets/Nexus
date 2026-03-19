package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

var ctx = context.Background()

const (
	BinanceWSURL = "wss://stream.binance.com:9443/ws/btcusdt@trade"
	RedisChannel = "trades"
)

// Internal data format for Next.js frontend
type CryptoData struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Timestamp int64   `json:"timestamp" tabular-nums:"true"`
}

// Binance trade message format
type BinanceTrade struct {
	Price     string `json:"p"`
	Symbol    string `json:"s"`
	Timestamp int64  `json:"T"`
}

func main() {
	// 1. Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", 
		DB:       0,  
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Successfully connected to Redis.")

	// 2. Start Binance WebSocket Subscriber in background
	go startBinanceSubscriber(rdb)

	// 3. Setup Client WebSocket route
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(w, r, rdb)
	})

	log.Println("WebSocket server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func startBinanceSubscriber(rdb *redis.Client) {
	for {
		log.Printf("Connecting to Binance WebSocket: %s", BinanceWSURL)
		conn, _, err := websocket.DefaultDialer.Dial(BinanceWSURL, nil)
		if err != nil {
			log.Printf("Error connecting to Binance: %v. Retrying in 5s...", err)
			time.Sleep(5 * time.Second)
			continue
		}

		log.Println("Connected to Binance WebSocket.")

		// Simple JSON mapping
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Printf("Binance connection closed: %v. Reconnecting...", err)
				break
			}

			var trade BinanceTrade
			if err := json.Unmarshal(message, &trade); err != nil {
				continue
			}

			// Map to our internal struct
			var price float64
			fmt.Sscanf(trade.Price, "%f", &price)

			data := CryptoData{
				Symbol:    "BTC/USD", // Standardized symbol for UI
				Price:     price,
				Timestamp: trade.Timestamp / 1000, // Convert to seconds
			}

			// Publish to Redis
			jsonData, _ := json.Marshal(data)
			rdb.Publish(ctx, RedisChannel, jsonData)
		}
		conn.Close()
		time.Sleep(1 * time.Second)
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request, rdb *redis.Client) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()
	log.Println("Client connected to local stream.")

	// Subscribe to Redis updates
	pubsub := rdb.Subscribe(ctx, RedisChannel)
	defer pubsub.Close()

	ch := pubsub.Channel()

	for msg := range ch {
		err := conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload))
		if err != nil {
			log.Println("Client disconnected:", err)
			return
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(reconnectDelay):
		}
	}
}

func mapBinanceTradeToPayload(raw []byte, now time.Time) (cryptoData, error) {
	var tradeMsg binanceTradeMessage
	if err := json.Unmarshal(raw, &tradeMsg); err != nil {
		return cryptoData{}, err
	}

	price, err := strconv.ParseFloat(strings.TrimSpace(tradeMsg.Price), 64)
	if err != nil {
		return cryptoData{}, err
	}

	if math.IsNaN(price) || math.IsInf(price, 0) {
		return cryptoData{}, errors.New("invalid non-finite price value")
	}

	timestamp := now.Unix()
	if tradeMsg.TradeTime > 0 {
		timestamp = tradeMsg.TradeTime / 1000
	}

	return cryptoData{
		Symbol:    "BTC/USDT",
		Price:     price,
		Timestamp: timestamp,
	}, nil
}
