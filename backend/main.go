package main

import (
	"context"
	"encoding/json"
	"errors"
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
	binanceTradeStreamURL = "wss://stream.binance.com:9443/ws/btcusdt@trade"
	redisChannel          = "crypto_data"
	writeTimeout          = 5 * time.Second
	reconnectDelay        = 3 * time.Second
)

type cryptoData struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Timestamp int64   `json:"timestamp"`
}

type binanceTradeMessage struct {
	Price     string `json:"p"`
	TradeTime int64  `json:"T"`
}

func main() {
	// Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// Test Redis Connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Successfully connected to Redis.")

	// Setup WebSocket route
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(w, r, rdb)
	})

	log.Println("WebSocket server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request, rdb *redis.Client) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()
	log.Println("New WebSocket client connected")

	clientCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	if err := streamBinanceTrades(clientCtx, conn, rdb); err != nil {
		log.Println("Stopped streaming Binance trades:", err)
	}
}

func streamBinanceTrades(ctx context.Context, clientConn *websocket.Conn, rdb *redis.Client) error {
	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
		NetDialContext: (&net.Dialer{
			Timeout:   10 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
	}

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		binanceConn, _, err := dialer.DialContext(ctx, binanceTradeStreamURL, nil)
		if err != nil {
			log.Printf("Failed to connect to Binance stream: %v. Reconnecting in %s", err, reconnectDelay)
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(reconnectDelay):
				continue
			}
		}

		log.Println("Connected to Binance BTCUSDT trade stream")

		for {
			_, rawMessage, err := binanceConn.ReadMessage()
			if err != nil {
				log.Printf("Binance stream read error: %v", err)
				_ = binanceConn.Close()
				break
			}

			payload, err := mapBinanceTradeToPayload(rawMessage, time.Now())
			if err != nil {
				log.Printf("Skipping invalid Binance trade payload: %v", err)
				continue
			}

			payloadBytes, err := json.Marshal(payload)
			if err != nil {
				log.Printf("Failed to encode payload: %v", err)
				continue
			}

			if err := rdb.Publish(ctx, redisChannel, payloadBytes).Err(); err != nil {
				log.Printf("Failed to publish payload to Redis channel %q: %v", redisChannel, err)
			}

			if err := clientConn.SetWriteDeadline(time.Now().Add(writeTimeout)); err != nil {
				_ = binanceConn.Close()
				return err
			}

			if err := clientConn.WriteMessage(websocket.TextMessage, payloadBytes); err != nil {
				_ = binanceConn.Close()
				return err
			}
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
