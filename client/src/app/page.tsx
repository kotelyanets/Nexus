import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpRight, Cpu, Globe, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-6 space-y-8 relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/20">
            NEXUS
          </h1>
          <p className="text-muted-foreground mt-2 text-xs font-bold tracking-widest flex items-center gap-2 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-Time Intelligence Hub • System v1.0.4
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WebSocket Status</span>
            <span className="text-emerald-400 text-xs font-black">CONNECTED</span>
          </div>
          <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold rounded-none px-8">
            TERMINAL
          </Button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "BTC/USD Index", value: "$64,231.50", change: "+2.4%", icon: Zap },
          { title: "Data Throughput", value: "14.2 TB/s", change: "Peak", icon: Activity },
          { title: "Verified Nodes", value: "1,248", change: "Online", icon: Globe },
          { title: "Cluster Latency", value: "4ms", change: "Optimal", icon: Cpu },
        ].map((stat, i) => (
          <Card key={i} className="glass-card rounded-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <stat.icon className="w-12 h-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter text-white">{stat.value}</div>
              <p className="text-[10px] text-emerald-400 flex items-center mt-2 font-black tracking-widest uppercase">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <Card className="lg:col-span-2 glass-card rounded-none h-[450px] flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
          <div className="text-center space-y-6 relative z-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <Activity className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white uppercase italic">Real-Time Pulse</h3>
              <p className="text-xs text-muted-foreground max-w-[320px] mx-auto mt-2 font-medium leading-relaxed">
                Aggregating multi-chain data streams... establishing neural link with backend clusters.
              </p>
            </div>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-none text-[10px] font-black tracking-[0.2em] uppercase">
              Initialize Data Link
            </Button>
          </div>
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
            <div className="absolute top-1/4 w-full h-px bg-white" />
            <div className="absolute top-2/4 w-full h-px bg-white" />
            <div className="absolute top-3/4 w-full h-px bg-white" />
            <div className="absolute left-1/4 h-full w-px bg-white" />
            <div className="absolute left-2/4 h-full w-px bg-white" />
            <div className="absolute left-3/4 h-full w-px bg-white" />
          </div>
        </Card>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <Card className="glass-card rounded-none border-t-2 border-t-emerald-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest">
                <Activity className="w-3 h-3 text-emerald-400" />
                Live Network Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="w-1 h-8 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-white/80 uppercase truncate">Packet Block_0x{i}ADF verified</p>
                      <p className="text-[9px] text-muted-foreground font-bold tabular-nums">12:45:0{i} • LATENCY 4ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-none bg-emerald-500/5 border-emerald-500/20 group overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Cpu className="w-24 h-24" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-none bg-emerald-400 text-black">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest">System Engine</h4>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium leading-relaxed">
                    Optimal throughput detected. No anomalies in telemetry.
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
