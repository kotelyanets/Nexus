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
  const [throughput, setThroughput] = useState<number>(0); // KB/s
  const [pps, setPps] = useState<number>(0); // Packets Per Second
  
  const ws = useRef<WebSocket | null>(null);
  const bytesRef = useRef<number>(0);
  const packetsRef = useRef<number>(0);

  // Interval to calculate throughput every second
  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput(bytesRef.current / 1024);
      setPps(packetsRef.current);
      bytesRef.current = 0;
      packetsRef.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("WebSocket Connected");
        setStatus("connected");
      };

      ws.current.onmessage = (event) => {
        try {
          // Track throughput
          const msgSize = typeof event.data === "string" ? event.data.length : event.data.size || 0;
          bytesRef.current += msgSize;
          packetsRef.current += 1;

          const parsedData: CryptoData = JSON.parse(event.data);
          setData(parsedData);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected");
        setStatus("disconnected");
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

  return { data, status, throughput, pps };
}
