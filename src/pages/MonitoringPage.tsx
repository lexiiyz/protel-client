"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddCameraModal from "@/components/AddCamera";
import EditCameraModal from "@/components/EditCamera";
import SmartCCTV from "@/components/CCTVViewer";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    History, Cctv, Settings, Trash2, 
    Signal, SignalZero, Activity, Wifi, MapPin 
} from "lucide-react"; 

type Camera = {
  id: number;
  name: string;
  location: string;
  type: string;       
  ipAddress: string;
  status: string;
  wsPort: number;
  username?: string;
  password?: string;
  channel?: string;
};

export default function MonitoringPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(null);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCameras = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/cameras");
      const data = await res.json();
      setCameras(data);

      // Jika ada kamera tapi belum ada yang aktif, set yang pertama
      if (!activeCamera && data.length > 0) {
        setActiveCamera(data[0]);
      }
    } catch (error) {
      console.error("Gagal load camera:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const openEdit = (cam: Camera) => {
    setEditingCamera(cam);
    setEditOpen(true);
  };

  const deleteCamera = async (id: number) => {
    if (!confirm("Hapus kamera ini? Konfigurasi tidak dapat dikembalikan.")) return;

    try {
        const res = await fetch(`http://localhost:5005/api/cameras/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            const updated = cameras.filter(c => c.id !== id);
            setCameras(updated);
            // Jika kamera yang dihapus sedang aktif, pindah ke kamera lain
            if (activeCamera?.id === id) {
                setActiveCamera(updated.length > 0 ? updated[0] : null);
            }
        } else {
            alert("Gagal menghapus kamera");
        }
    } catch(e) {
        alert("Error server.");
    }
  };

  const getStatusColor = (status: string) => {
      return status === 'Online' || status === 'Ready' 
        ? "text-green-400 bg-green-400/10 border-green-400/20" 
        : "text-red-400 bg-red-400/10 border-red-400/20";
  };

  return (
    <div className="mx-auto max-w-9xl px-6 mt-30 pb-20 min-h-screen">
      
      {/* === Header === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500" /> Pusat Monitoring
            </h1>
            <p className="text-slate-400 text-sm mt-1 ml-11">Pantau feed CCTV dan status perangkat secara real-time.</p>
        </div>
        
        <div className="flex gap-3">
            <Link to="/logs">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                    <History className="w-4 h-4 mr-2" />
                    Log Pelanggaran
                </Button>
            </Link>
            <AddCameraModal onAdded={loadCameras} />
        </div>
      </div>

      {cameras.length === 0 && !loading ? (
        <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl">
          <Cctv className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-50" />
          <p className="text-xl font-semibold text-slate-400">Sistem Offline / Tidak Ada Kamera</p>
          <p className="text-slate-500 mt-2">Silakan tambahkan perangkat kamera baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === MAIN PLAYER (Kiri) === */}
          <div className="lg:col-span-2">
             <Card className="bg-black/80 border border-blue-500/30 shadow-2xl overflow-hidden rounded-2xl relative">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent z-10 flex justify-between items-start pointer-events-none">
                    <div>
                        <h2 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
                             {activeCamera?.name || "Memilih Kamera..."}
                             {activeCamera?.status === 'Online' && (
                                 <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                 </span>
                             )}
                        </h2>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {activeCamera?.location || "-"}
                        </p>
                    </div>
                    {activeCamera && (
                        <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-mono text-cyan-400 backdrop-blur-sm">
                            {activeCamera.type} • {activeCamera.ipAddress}
                        </div>
                    )}
                </div>

                {/* Player Content */}
                <CardContent className="p-0 aspect-video bg-slate-950 flex items-center justify-center relative">
                  {activeCamera ? (
                    <div className="w-full h-full relative">
                        <SmartCCTV camera={activeCamera} />
                        
                        {/* Grid Overlay Effect (Optional Aesthetic) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] pointer-events-none bg-[length:100%_4px,6px_100%]"></div>
                    </div>
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center animate-pulse">
                        <SignalZero className="w-12 h-12 mb-2" />
                        <p>Pilih kamera dari daftar</p>
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>

          {/* === CAMERA LIST (Kanan) === */}
          <div className="lg:col-span-1 flex flex-col h-[600px]">
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-t-xl p-4 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-blue-400" /> Perangkat Tersedia
                </h3>
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{cameras.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900/30 border-x border-b border-white/10 rounded-b-xl p-3 space-y-3 custom-scrollbar">
                {cameras.map((cam) => {
                    const isActive = activeCamera?.id === cam.id;
                    const isOnline = cam.status === 'Online' || cam.status === 'Ready';

                    return (
                        <div
                            key={cam.id}
                            onClick={() => setActiveCamera(cam)}
                            className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                isActive 
                                ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                                : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600"
                            }`}
                        >
                            {/* Active Indicator Line */}
                            {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full"></div>}

                            <div className="flex justify-between items-start mb-2 pl-2">
                                <div>
                                    <h4 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {cam.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3" /> {cam.location}
                                    </p>
                                </div>
                                <div className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${getStatusColor(cam.status)}`}>
                                    {isOnline ? <Signal className="w-3 h-3" /> : <SignalZero className="w-3 h-3" />}
                                    {cam.status}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 pl-2 border-t border-white/5 pt-2">
                                <span className="text-[10px] font-mono text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">
                                    {cam.type}
                                </span>
                                
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700" 
                                        onClick={(e) => { e.stopPropagation(); openEdit(cam); }}
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                        size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        onClick={(e) => { e.stopPropagation(); deleteCamera(cam.id); }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Edit */}
      {editingCamera && (
        <EditCameraModal
          camera={editingCamera}
          open={editOpen}
          onOpenChange={(v) => setEditOpen(v)}
          onUpdated={loadCameras}
        />
      )}
    </div>
  );
}