"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    PlusCircle, Camera, MapPin, Globe, User, 
    Lock, Tv, Laptop, Save, Loader2 
} from "lucide-react";

export default function AddCameraModal({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    type: "RTSP",
    ipAddress: "",
    username: "",
    password: "",
    channel: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      type: "RTSP",
      ipAddress: "",
      username: "",
      password: "",
      channel: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Persiapan Payload
        const payload = {
            ...form,
            // Jika Webcam, paksa localhost agar validasi backend lolos
            ipAddress: form.type === "WEBCAM" ? "localhost" : form.ipAddress
        };

        const res = await fetch("http://localhost:5005/api/cameras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            onAdded();
            resetForm();
            setOpen(false); 
        } else {
            const err = await res.json();
            alert("Gagal: " + (err.message || "Kesalahan server"));
        }
    } catch (error) {
        alert("Gagal menghubungi server.");
    } finally {
        setLoading(false);
    }
  };

  // Styling
  const inputStyle = "bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";
  const labelStyle = "text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white font-bold transition-all">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Kamera
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-slate-900 border border-slate-700 shadow-2xl p-0 overflow-hidden text-white gap-0">
        
        {/* Header */}
        <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Camera className="w-5 h-5 text-blue-500" /> Tambah Perangkat Baru
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Hubungkan CCTV RTSP atau Webcam lokal ke sistem monitoring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            
            {/* Nama & Lokasi */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label className={labelStyle}>Nama Kamera</Label>
                    <Input
                        placeholder="Contoh: CCTV Gerbang Utama"
                        className={inputStyle}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div className="col-span-2">
                    <Label className={labelStyle}><MapPin className="w-3 h-3"/> Lokasi</Label>
                    <Input
                        placeholder="Contoh: Area Parkir B1"
                        className={inputStyle}
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Tipe Kamera */}
            <div>
                <Label className={labelStyle}>Tipe Perangkat</Label>
                <Select 
                    value={form.type} 
                    onValueChange={(val) => setForm({ ...form, type: val })}
                >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-11">
                        <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        <SelectItem value="RTSP" className="focus:bg-slate-800 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Tv className="w-4 h-4 text-blue-400" /> 
                                <span>IP Camera / CCTV (RTSP)</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="WEBCAM" className="focus:bg-slate-800 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Laptop className="w-4 h-4 text-green-400" /> 
                                <span>Webcam Lokal (USB)</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Konfigurasi RTSP (Conditional) */}
            {form.type === "RTSP" ? (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Koneksi Jaringan</span>
                        </div>
                        
                        <div>
                            <Label className={labelStyle}>IP Address / Host</Label>
                            <Input
                                placeholder="192.168.1.xxx"
                                className={inputStyle}
                                value={form.ipAddress}
                                onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className={labelStyle}><User className="w-3 h-3"/> Username</Label>
                                <Input
                                    placeholder="admin"
                                    className={inputStyle}
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label className={labelStyle}><Lock className="w-3 h-3"/> Password</Label>
                                <Input
                                    placeholder="••••••"
                                    type="password"
                                    className={inputStyle}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className={labelStyle}>Stream Path / Channel</Label>
                            <Input
                                placeholder="Contoh: /live/ch0"
                                className={inputStyle}
                                value={form.channel}
                                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Kosongkan jika hanya menggunakan IP default.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg animate-in fade-in">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500/20 rounded-full">
                            <Laptop className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-green-400">Mode Webcam Lokal</h4>
                            <p className="text-xs text-slate-400 mt-1">
                                Sistem akan menggunakan kamera default yang terhubung ke komputer/server ini (USB/Integrated). Tidak perlu konfigurasi IP.
                            </p>
                        </div>
                    </div>
                </div>
            )}

          </div>

          <DialogFooter className="p-6 bg-slate-950/50 border-t border-slate-800">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 mr-auto">
                Batal
             </Button>
             <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 px-6">
                {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                    <><Save className="w-4 h-4 mr-2" /> Simpan Kamera</>
                )}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}