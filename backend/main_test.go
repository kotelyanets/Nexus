package main

import (
	"testing"
	"time"
)

func TestMapBinanceTradeToPayload_ValidMessage(t *testing.T) {
	now := time.Unix(1234567890, 0)
	raw := []byte(`{"p":"65001.12","T":1700000000123}`)

	payload, err := mapBinanceTradeToPayload(raw, now)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if payload.Symbol != "BTC/USD" {
		t.Fatalf("unexpected symbol: %s", payload.Symbol)
	}

	if payload.Price != 65001.12 {
		t.Fatalf("unexpected price: %f", payload.Price)
	}

	if payload.Timestamp != 1700000000 {
		t.Fatalf("unexpected timestamp: %d", payload.Timestamp)
	}
}

func TestMapBinanceTradeToPayload_InvalidPrice(t *testing.T) {
	now := time.Unix(1234567890, 0)
	raw := []byte(`{"p":"bad-price","T":1700000000123}`)

	_, err := mapBinanceTradeToPayload(raw, now)
	if err == nil {
		t.Fatal("expected error for invalid price")
	}
}

func TestMapBinanceTradeToPayload_UsesCurrentTimeWhenMissingTradeTime(t *testing.T) {
	now := time.Unix(1234567890, 0)
	raw := []byte(`{"p":"123.45"}`)

	payload, err := mapBinanceTradeToPayload(raw, now)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if payload.Timestamp != now.Unix() {
		t.Fatalf("expected timestamp %d, got %d", now.Unix(), payload.Timestamp)
	}
}
