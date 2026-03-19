# High-Load Real-Time Crypto Analytics Dashboard

A high-performance dashboard for streaming and visualizing real-time cryptocurrency data.

## Features
- **Real-Time Data Streams**: Built with Go and WebSockets for ultra-low latency.
- **High-Performance Caching**: Powered by Redis Pub/Sub.
- **Modern UI**: Next.js 14 App Router, Tailwind CSS, and shadcn/ui.

## Current Progress
- [x] Phase 1: Infrastructure (Docker/Redis)
- [x] Phase 2: Backend Initialization (Go WebSockets)
- [ ] Phase 3: Frontend Initialization (Next.js)
- [ ] Phase 4: Real-time Data Visualization (Charts & UI)

## Getting Started

### Backend
1. Start the Redis container:
   ```bash
   docker compose up -d
   ```
2. Run the Go WebSocket server:
   ```bash
   cd backend
   go run main.go
   ```
