"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  Loader2, 
  RefreshCcw, 
  Users, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  ShieldCheck,
  Activity
} from "lucide-react";


const COLORS = ["#22c55e", "#ef4444"]; // Hijau (Patuh), Merah (Melanggar)

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalPekerja: 0,
    violationsToday: 0,
    totalViolationsAllTime: 0,
    attendanceChart: [],
    complianceData: [
        { name: "Patuh", value: 1 }, 
        { name: "Melanggar", value: 0 }
    ],
    activities: [] as { message: string; time: string }[]
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Ganti URL sesuai endpoint kamu
      const res = await fetch("http://localhost:5005/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Gagal ambil stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && stats.totalPekerja === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-blue-400 gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-12 h-12 animate-spin relative z-10" />
            </div>
            <span className="text-sm font-medium tracking-wider text-slate-400">MEMUAT SISTEM...</span>
        </div>
      )
  }

  // Style reusable untuk Card agar konsisten (Glassmorphism)
  const cardStyle = "bg-slate-900/50 backdrop-blur-md border-white/10 shadow-xl text-white hover:border-blue-500/30 transition-all duration-300";

  return (
    <div className="grid gap-8 min-h-screen py-8 px-6 md:px-12 mt-20">
      
      {/* === Header Section === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Dashboard Monitoring
            </h2>
            <p className="text-slate-400 text-sm mt-1">Ringkasan aktivitas dan status keamanan real-time.</p>
          </div>
          
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
          >
             <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
             Refresh Data
          </Button>
      </div>

      {/* === Summary Cards === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Pekerja */}
        <Card className={cardStyle}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Pekerja</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">{stats.totalPekerja}</div>
            <p className="text-xs text-slate-500 mt-2">Personil terdaftar dalam sistem</p>
          </CardContent>
        </Card>

        {/* Card 2: Pelanggaran Hari Ini */}
        <Card className={cardStyle}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pelanggaran (24j)</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">
                {stats.violationsToday}
            </div>
            <p className="text-xs text-slate-500 mt-2">Terdeteksi sejak 00:00 WIB</p>
          </CardContent>
        </Card>

        {/* Card 3: Total Log */}
        <Card className={cardStyle}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Riwayat</CardTitle>
            <FileText className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-400">{stats.totalViolationsAllTime}</div>
             <p className="text-xs text-slate-500 mt-2">Akumulasi insiden tercatat</p>
          </CardContent>
        </Card>
      </div>

      {/* === Grafik Section === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRAFIK KEHADIRAN */}
        <Card className={cardStyle}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Tren Kehadiran (5 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }}
                    cursor={{fill: '#ffffff05'}}
                />
                <Bar 
                    dataKey="hadir" 
                    name="Hadir" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                    className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GRAFIK KEPATUHAN */}
        <Card className={cardStyle}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Rasio Kepatuhan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center relative">
            {stats.complianceData.every(d => d.value === 0) ? (
                <div className="text-center text-slate-500">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>Menunggu data masuk...</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.complianceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                    {stats.complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
                </ResponsiveContainer>
            )}
            
            {/* Legend Custom */}
            <div className="absolute bottom-2 flex gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
                    Patuh
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> 
                    Melanggar
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === Aktivitas Terbaru === */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Log Aktivitas Terkini
        </h2>
        
        <div className="space-y-3">
            {stats.activities.length === 0 ? (
                 <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                    <p className="text-slate-500 text-sm">Belum ada aktivitas tercatat hari ini.</p>
                 </div>
            ) : (
                stats.activities.map((act, idx) => (
                    <div key={idx} className="group relative bg-slate-900/40 border border-slate-800 rounded-lg p-4 hover:bg-slate-800/60 hover:border-slate-700 transition-all">
                        {/* Garis indikator di kiri */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-700 rounded-l-lg group-hover:w-1.5 transition-all"></div>
                        
                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <p className="text-slate-200 font-medium text-sm">{act.message}</p>
                                <p className="text-xs text-red-400/80 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Deteksi Pelanggaran
                                </p>
                            </div>
                            <span className="text-xs font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
                                {new Date(act.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}