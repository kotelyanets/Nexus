"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, Cpu, Globe, Zap, RefreshCw } from "lucide-react";
import { useWebSocket, CryptoData } from "@/hooks/use-websocket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function DashboardPage() {
  const { data, status } = useWebSocket("ws://localhost:8080/ws");
  const [history, setHistory] = useState<CryptoData[]>([]);
  const [logs, setLogs] = useState<{ id: string; msg: string; time: string }[]>([]);

  // Update history when new data arrives
  useEffect(() => {
    if (data) {
      setHistory((prev) => {
        const newHistory = [...prev, data].slice(-30); // Keep last 30 points
        return newHistory;
      });

      // Add to logs
      setLogs((prev) => [
        {
          id: Math.random().toString(36).substr(2, 9),
          msg: `Price Update: ${data.symbol} caught at $${data.price.toLocaleString()}`,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 10)); // Keep last 10 logs
    }
  }, [data]);

  const currentPrice = data?.price || 64231.50;
  const priceChange = useMemo(() => {
    if (history.length < 2) return "+0.0%";
    const first = history[0].price;
    const last = history[history.length - 1].price;
    const diff = ((last - first) / first) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%`;
  }, [history]);

  return (
    <main className="container mx-auto p-4 md:p-10 space-y-8 relative z-10">
      {/* Header */}
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
            Real-Time Intelligence Hub • System v1.0.4 • {status.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Stream Integrity</span>
            <span className={`text-xs font-black tabular-nums ${status === "connected" ? "text-emerald-400" : "text-red-400"}`}>
              {status === "connected" ? "STABLE / 100%" : "FAULT / 0%"}
            </span>
          </div>
          <Button size="lg" className="bg-white text-black hover:bg-emerald-400 hover:text-black transition-all font-black rounded-none px-10 border-r-4 border-b-4 border-emerald-500/50">
            TERMINAL_EXE
          </Button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: "BTC/USD Live", value: `$${currentPrice.toLocaleString()}`, change: priceChange, icon: Zap, color: "text-emerald-400" },
          { title: "Throughput", value: "14.2 TB/s", change: "Peak", icon: Activity, color: "text-blue-400" },
          { title: "Mesh Nodes", value: "1,248", change: "Synced", icon: Globe, color: "text-purple-400" },
          { title: "Cluster Latency", value: "4.2ms", change: "-0.1ms", icon: Cpu, color: "text-orange-400" },
        ].map((stat, i) => (
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-Time Chart */}
        <Card className="lg:col-span-2 glass-card rounded-none h-[500px] relative overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5 py-4">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-xs font-black uppercase tracking-widest">Neural Link Visualization</CardTitle>
            </div>
            <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/20" />
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
                  <XAxis 
                    dataKey="timestamp" 
                    hide 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right"
                    tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '0', fontSize: '10px', color: '#fff' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500/50 animate-spin mx-auto" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Synchronizing Stream...</p>
                </div>
              </div>
            )}
            
            {/* Overlay Grid UI */}
            <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
               <Globe className="w-1/2 h-1/2" />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <Card className="glass-card rounded-none border-t-2 border-t-emerald-500/50 flex flex-col h-full">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest">
                <Activity className="w-3 h-3 text-emerald-400" />
                Stream Trace Log
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
                      <p className="text-[9px] text-muted-foreground font-bold tracking-widest mt-1">
                        {log.time} • PARITY OK
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 group-hover:text-emerald-400 transition-colors uppercase">
                      TRACE
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

          <Card className="glass-card rounded-none bg-emerald-500/5 border-emerald-500/20 group overflow-hidden border-r-4 border-r-emerald-500/20">
            <CardContent className="pt-6 relative">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-all duration-1000 rotate-12">
                <Cpu className="w-32 h-32" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-none bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] italic">System Core Engine</h4>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold leading-relaxed uppercase tracking-tighter">
                    Multithreaded WebSocket pipeline operational. Zero frame drops detected in last sequence.
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
