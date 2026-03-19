"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface CryptoData {
  symbol: string;
  price: number;
  timestamp: number;
}

export function useWebSocket(url: string) {
  const [data, setData] = useState<CryptoData | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("WebSocket Connected");
        setStatus("connected");
      };

      ws.current.onmessage = (event) => {
        try {
          const parsedData: CryptoData = JSON.parse(event.data);
          setData(parsedData);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected");
        setStatus("disconnected");
        // Simple reconnect logic
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        ws.current?.close();
      };
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err);
      setStatus("disconnected");
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return { data, status };
}
