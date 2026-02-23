"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
    Eye, ArrowLeft, AlertTriangle, Calendar, 
    MapPin, User, FileWarning, Loader2 
} from "lucide-react";

// Tipe Data
type ViolationLog = {
  id: number;
  camera_id: number;
  timestamp: string;
  details: string;
  image_path: string;
  vest_number: string;
  worker_name: string;
  Camera: { name: string; location: string };
};

export default function LogsPage() {
  const [logs, setLogs] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ViolationLog | null>(null); // Ganti string jadi object log biar bisa ambil detail

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
        const res = await fetch("http://localhost:5005/api/violations");
        const data = await res.json();
        // Sort data dari yang terbaru (opsional, kalau backend belum sort)
        // const sorted = data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(data);
    } catch (error) {
        console.error("Gagal load logs:", error);
    } finally {
        setLoading(false);
    }
  };

  const parseMissing = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      // Asumsi format: [{missing: ["helmet", "vest"]}]
      const all = data.flatMap((d: any) => d.missing);
      return [...new Set(all)]; // Return array string
    } catch { return []; }
  };

  const translateItem = (item: string) => {
      const dict: Record<string, string> = {
          helmet: "Helm", vest: "Rompi", gloves: "Sarung Tangan",
          glasses: "Kacamata", boots: "Sepatu", mask: "Masker"
      };
      return dict[item] || item;
  }

  return (
    <div className="mx-auto max-w-8xl px-6 mt-30 pb-20 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <Link to="/monitoring" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Monitoring
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 flex items-center gap-3">
                <FileWarning className="w-8 h-8 text-red-500" /> Log Pelanggaran APD
            </h1>
            <p className="text-slate-400 text-sm mt-1">
                Rekaman historis ketidakpatuhan penggunaan APD yang terdeteksi sistem.
            </p>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
                <p className="text-xs text-red-300 uppercase font-bold">Total Insiden</p>
                <p className="text-xl font-bold text-white">{logs.length}</p>
            </div>
        </div>
      </div>
      
      {/* --- TABEL LOGS --- */}
      <Card className="bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-slate-900/50 py-4">
            <CardTitle className="text-lg text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" /> Riwayat Deteksi Terbaru
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
                    <p className="text-slate-500">Mengambil data forensik...</p>
                </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-950/80">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold w-[180px]">Waktu Kejadian</TableHead>
                    <TableHead className="text-slate-400 font-bold">Lokasi & Kamera</TableHead>
                    <TableHead className="text-slate-400 font-bold">Identitas Personil</TableHead>
                    <TableHead className="text-slate-400 font-bold">Item Hilang (Pelanggaran)</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold">Bukti</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                              <div className="flex flex-col items-center">
                                  <FileWarning className="w-12 h-12 mb-3 opacity-20" />
                                  <p>Tidak ada data pelanggaran ditemukan.</p>
                              </div>
                          </TableCell>
                      </TableRow>
                  ) : (
                      logs.map((log) => {
                        const missingItems = parseMissing(log.details);
                        return (
                        <TableRow key={log.id} className="border-slate-800/50 hover:bg-white/5 transition-colors group">
                          
                          {/* Waktu */}
                          <TableCell className="align-top">
                            <div className="flex flex-col">
                                <span className="text-white font-mono font-medium">
                                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(log.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                </span>
                            </div>
                          </TableCell>
                          
                          {/* Lokasi */}
                          <TableCell className="align-top">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-300 font-bold text-sm flex items-center gap-1">
                                    {log.Camera?.name}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {log.Camera?.location}
                                </span>
                            </div>
                          </TableCell>
                          
                          {/* Identitas */}
                          <TableCell className="align-top">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <User className={`w-4 h-4 ${log.worker_name !== "Unknown" ? "text-blue-400" : "text-red-400"}`} />
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${log.worker_name !== "Unknown" ? "text-blue-100" : "text-red-300 italic"}`}>
                                        {log.worker_name !== "Unknown" ? log.worker_name : "Tidak Dikenal"}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5 bg-slate-950 px-1.5 py-0.5 rounded w-fit border border-slate-800">
                                        VEST: {log.vest_number !== "None" ? log.vest_number : "?"}
                                    </p>
                                </div>
                            </div>
                          </TableCell>

                          {/* Pelanggaran */}
                          <TableCell className="align-top">
                            <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(missingItems) && missingItems.length > 0 ? (
                                    missingItems.map((item: any, idx: number) => (
                                        <Badge key={idx} variant="destructive" className="bg-red-900/40 border-red-600/50 text-red-200 hover:bg-red-900/60 uppercase text-[10px] tracking-wide">
                                            {translateItem(item)}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-slate-500 italic text-xs">- Detail Error -</span>
                                )}
                            </div>
                          </TableCell>

                          {/* Button Bukti */}
                          <TableCell className="text-right align-top">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-slate-700 bg-slate-800/50 hover:bg-blue-600 hover:text-white hover:border-blue-500 text-slate-300 transition-all"
                                onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="w-3.5 h-3.5 mr-2"/> Bukti
                            </Button>
                          </TableCell>
                        </TableRow>
                      )})
                  )}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* --- MODAL FORENSIC VIEWER --- */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl bg-slate-950 border border-slate-800 p-0 overflow-hidden shadow-2xl">
           
           {/* Header Modal */}
           <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileWarning className="w-5 h-5 text-red-500" /> Bukti Pelanggaran
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">ID LOG: #{selectedLog?.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-red-400">
                        {selectedLog ? new Date(selectedLog.timestamp).toLocaleString('id-ID') : '-'}
                    </p>
                </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3">
               {/* Kolom Kiri: Gambar */}
               <div className="md:col-span-2 bg-black relative flex items-center justify-center min-h-[400px]">
                   {selectedLog && (
                       <img 
                            src={`http://localhost:5005${selectedLog.image_path}`} 
                            alt="Bukti Pelanggaran" 
                            className="w-auto max-h-[500px] object-contain" 
                       />
                   )}
                   {/* Watermark overlay */}
                   <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10">
                        <p className="text-xs text-white font-mono">SENTINELS EVIDENCE CAM</p>
                   </div>
               </div>

               {/* Kolom Kanan: Detail Data */}
               <div className="md:col-span-1 bg-slate-900 p-6 border-l border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Pelanggar</h3>
                        <div className="p-3 bg-slate-950 rounded border border-slate-800">
                            <p className="text-lg font-bold text-white">{selectedLog?.worker_name}</p>
                            <p className="text-sm text-slate-400">Vest: {selectedLog?.vest_number}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Lokasi</h3>
                        <div className="flex items-center gap-2 text-slate-300">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{selectedLog?.Camera?.location}</span>
                        </div>
                        <div className="text-xs text-slate-500 ml-6 mt-1">{selectedLog?.Camera?.name}</div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Item Tidak Dipakai</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedLog && parseMissing(selectedLog.details).map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {translateItem(item)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 mt-auto border-t border-slate-800">
                        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setSelectedLog(null)}>
                            Tutup Viewer
                        </Button>
                    </div>
               </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}