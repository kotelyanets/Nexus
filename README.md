# Nexus — High-Load Real-Time Crypto Analytics Dashboard

<p align="center">
  <strong>Low-latency market telemetry pipeline for BTC/USDT</strong><br/>
  <em>Binance WebSocket → Go streaming bridge → Redis Pub/Sub → Next.js real-time dashboard</em>
</p>

<p align="center">
  <img alt="Go" src="https://img.shields.io/badge/Backend-Go-00ADD8?logo=go&logoColor=white">
  <img alt="Next.js" src="https://img.shields.io/badge/Frontend-Next.js%2014-000000?logo=nextdotjs&logoColor=white">
  <img alt="Redis" src="https://img.shields.io/badge/Broker-Redis-DC382D?logo=redis&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/UI-TypeScript-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Style-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="WebSocket" src="https://img.shields.io/badge/Transport-WebSocket-8A2BE2">
</p>

---

## Overview

Nexus is a real-time cryptocurrency analytics dashboard built for a high-frequency streaming workflow. The system ingests live Binance BTC/USDT trade events, normalizes them in Go, distributes them through Redis Pub/Sub, and renders live telemetry in a Next.js dashboard with low UI update latency.

The current implementation is focused on a **single live market stream (`btcusdt@trade`)** and a **single dashboard channel** for rapid, production-oriented iteration.

---

## Architecture

```text
Binance WebSocket (btcusdt@trade)
          │
          ▼
   Go Stream Bridge (backend/:8080)
   - reads Binance trade frames
   - maps payload -> {symbol, price, timestamp}
   - publishes Redis channel: trades
          │
          ▼
      Redis Pub/Sub (:6379)
          │
          ▼
   Go WS Endpoint (/ws)
   - subscribes Redis channel
   - broadcasts JSON frames to clients
          │
          ▼
Next.js Dashboard (client/:3000)
- custom WebSocket hook
- live stats + throughput + packet rate
- real-time chart + market trace panel
```

---

## Core Features

- **Live BTC/USDT stream ingestion** from Binance WebSocket API.
- **Low-overhead backend bridge** in Go (WebSocket + Redis).
- **Redis Pub/Sub fan-out layer** for internal event distribution.
- **Real-time dashboard UI** with:
  - live price state,
  - throughput (KB/s),
  - packet rate (PKTS/s),
  - rolling chart history,
  - market event trace panel.
- **Modern frontend stack** using Next.js App Router + TypeScript + Tailwind + Recharts + shadcn/ui.
- **Containerized Redis** startup via Docker Compose.

---

## Repository Structure

```text
Nexus/
├── backend/
│   ├── main.go         # Go bridge: Binance -> Redis -> local WS clients
│   └── main_test.go    # Backend mapping tests
├── client/
│   ├── src/app/        # Next.js App Router pages/layout
│   ├── src/hooks/      # useWebSocket client hook
│   └── package.json
├── docker-compose.yml  # Redis service definition
└── README.md
```

---

## Tech Stack

### Backend
- Go
- Gorilla WebSocket
- go-redis (Redis v9 client)

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Recharts
- shadcn/ui primitives

### Infrastructure
- Docker + Docker Compose
- Redis (Pub/Sub)

---

## Prerequisites

Install the following locally:

- **Go** (compatible with `backend/go.mod`)
- **Node.js 18+** and **npm**
- **Docker** + **Docker Compose**

---

## Quick Start

### 1) Start Redis

From repository root:

```bash
docker compose up -d
```

Redis will be available at `localhost:6379`.

### 2) Start backend bridge

```bash
cd backend
go run main.go
```

Backend server starts on `:8080` and exposes a WebSocket endpoint at:

- `ws://localhost:8080/ws`

### 3) Start frontend dashboard

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open:

- `http://localhost:3000`

---

## Runtime Ports

| Service | Port | Purpose |
|---|---:|---|
| Redis | `6379` | Pub/Sub transport |
| Go backend | `8080` | Local WebSocket stream for dashboard clients |
| Next.js frontend | `3000` | Dashboard UI |

---

## Data Contract

The backend pushes normalized JSON payloads to frontend clients:

```json
{
  "symbol": "BTC/USDT",
  "price": 65001.12,
  "timestamp": 1700000000
}
```

Field definitions:

- `symbol` — display symbol used by UI.
- `price` — trade price (float).
- `timestamp` — Unix timestamp in seconds.

---

## Development Commands

### Backend

```bash
cd backend
go test ./...
go run main.go
```

### Frontend

```bash
cd client
npm run lint
npm run build
npm run dev
```

---

## Implementation Notes

- The frontend currently connects to `ws://localhost:8080/ws`.
- Binance source stream is hard-coded to BTC/USDT trade feed in backend constants.
- Redis channel used by the backend is `trades`.
- Current CORS/origin handling in backend is permissive for development.

---

## Troubleshooting

### Frontend shows disconnected state

- Verify Redis is running: `docker ps`
- Verify backend is running on `:8080`
- Confirm `ws://localhost:8080/ws` is reachable from browser environment

### No market updates

- Check backend logs for Binance connection retries
- Ensure outbound network access to Binance WebSocket endpoint is available
- Confirm Redis is reachable at `localhost:6379`

### Build issues in restricted environments

The frontend uses `next/font/google` (Inter). In network-restricted environments, `next build` can fail if Google Fonts cannot be resolved.

---

## Roadmap (Suggested Next Steps)

- Multi-symbol stream support (dynamic subscriptions)
- Authenticated, secured WS transport
- Backpressure-aware buffering and bounded queues
- Persistent time-series storage for historical analytics
- Multi-instance backend horizontal scaling
- Observability stack (metrics/traces/log correlation)

---

## Contributing

1. Fork and create a feature branch.
2. Keep changes focused and minimal.
3. Run relevant tests/lint before submitting.
4. Open a pull request with clear technical context.

---

## Disclaimer

This project is for educational and technical demonstration purposes. It is not financial advice and should not be used as the sole basis for trading decisions.
