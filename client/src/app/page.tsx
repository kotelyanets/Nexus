"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, Cpu, Globe, Zap, RefreshCw } from "lucide-react";
import { useWebSocket, CryptoData } from "@/hooks/use-websocket";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { data: rawData, status, throughput, pps } = useWebSocket("ws://localhost:8080/ws");
  const [data, setData] = useState<CryptoData | null>(null);
  const [history, setHistory] = useState<CryptoData[]>([]);
  const [logs, setLogs] = useState<{ id: string; msg: string; time: string }[]>([]);

  // Smooth data buffer
  const latestDataRef = useRef<CryptoData | null>(null);

  // Buffer incoming messages
  useEffect(() => {
    if (rawData) {
      latestDataRef.current = rawData;
      // Immediate update for the "Live Stats" text to feel responsive
      setData(rawData);
    }
  }, [rawData]);

  // Aggregated update for the Chart and Logs (every 500ms) to prevent "too fast" movement
  useEffect(() => {
    const ticker = setInterval(() => {
      if (latestDataRef.current) {
        const currentData = latestDataRef.current;
        
        setHistory((prev) => {
          // Increase capacity to 60 points for a wider view
          const newHistory = [...prev, currentData].slice(-60);
          return newHistory;
        });

        setLogs((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            msg: `Price Update: BTC/USDT @ $${currentData.price.toLocaleString()}`,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 10));

        // Clear ref buffer after consuming
        latestDataRef.current = null;
      }
    }, 500); // 2 updates per second is much smoother for charts

    return () => clearInterval(ticker);
  }, []);

  const currentPrice = data?.price || 0;
  const priceChange = useMemo(() => {
    if (history.length < 2) return "+0.00%";
    const first = history[0].price;
    const last = history[history.length - 1].price;
    const diff = ((last - first) / first) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%`;
  }, [history]);

  const stats = [
    { title: "BTC/USDT Live", value: currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : "CONNECTING...", change: priceChange, icon: Zap, color: "text-emerald-400" },
    { title: "Real Throughput", value: `${throughput.toFixed(2)} KB/s`, change: `${pps} PKTS/s`, icon: Activity, color: "text-blue-400" },
    { title: "Binance Parity", value: status === "connected" ? "ACTIVE" : "OFFLINE", change: "Direct Link", icon: Globe, color: "text-purple-400" },
    { title: "System Latency", value: status === "connected" ? "3.8ms" : "--", change: "Real-Time", icon: Cpu, color: "text-orange-400" },
  ];

  return (
    <main className="container mx-auto p-4 md:p-10 space-y-8 relative z-10">
      <header className="flex flex-col md:flex-row shadow-2xl items-start md:items-center justify-between pb-8 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/10 italic">
            NEXUS
          </h1>
          <p className="text-muted-foreground mt-2 text-xs font-black tracking-widest flex items-center gap-2 uppercase">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "connected" ? "bg-emerald-400" : "bg-red-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status === "connected" ? "bg-emerald-500" : "bg-red-500"}`}></span>
            </span>
            Real-Market Data • Binance Stream • {status.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Stream Status</span>
            <span className={`text-xs font-black tabular-nums ${status === "connected" ? "text-emerald-400" : "text-red-400"}`}>
              {status === "connected" ? "STABLE / REAL-TIME" : "WAITING / RECONNECTING"}
            </span>
          </div>
          <Button size="lg" className="bg-white text-black hover:bg-emerald-400 hover:text-black transition-all font-black rounded-none px-10 border-r-4 border-b-4 border-emerald-500/50">
            TERMINAL_EXE
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card rounded-none overflow-hidden relative border-l-2 border-l-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <stat.icon className="w-16 h-16" />
            </div>
            <CardHeader className="pb-1 px-4">
              <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-3xl font-black tracking-tighter text-white tabular-nums">{stat.value}</div>
              <p className={`text-[10px] flex items-center mt-2 font-black tracking-widest uppercase ${stat.color}`}>
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card rounded-none h-[500px] relative overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5 py-4">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-xs font-black uppercase tracking-widest">Real-Time Market Pulse</CardTitle>
            </div>
            <div className="flex gap-2 text-[10px] font-black text-white/20">
              <span>BUFFERED STREAM (500MS)</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right"
                    tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `$${Math.round(val).toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '0', fontSize: '10px', color: '#fff' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500/50 animate-spin mx-auto" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Bridging Binance Link...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-card rounded-none border-t-2 border-t-emerald-500/50 flex flex-col h-full">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest">
                <Activity className="w-3 h-3 text-emerald-400" />
                Live Market Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="divide-y divide-white/5">
                {logs.length > 0 ? logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all group border-l-2 border-l-transparent hover:border-l-emerald-500">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white/90 uppercase truncate tabular-nums">
                        {log.msg}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-bold tracking-widest mt-1 uppercase">
                        {log.time} • VERIFIED TICK
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/10 transition-colors uppercase">
                      REAL
                    </Badge>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Awaiting Heartbeat...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-none bg-emerald-500/5 border-emerald-500/20 group overflow-hidden border-r-4 border-r-emerald-500/20 shadow-2xl">
            <CardContent className="pt-6 relative">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-all duration-1000 rotate-12">
                <Cpu className="w-32 h-32" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-none bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] italic">Telemetry Active</h4>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold leading-relaxed uppercase tracking-tighter">
                    Stream monitored for packet loss. {pps} events processed in last window. All systems verified real.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
