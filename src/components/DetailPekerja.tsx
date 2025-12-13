import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Edit, Save, X, User, CreditCard, Hash, Briefcase, ScanFace, CheckCircle, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

type PekerjaItem = {
    id_pekerja: string;
    nama: string;
    nomor_vest: string;
    jabatan: string; 
    is_active: boolean;
    has_face_data: boolean;
};

type JabatanOption = {
    id: string;
    nama_jabatan: string;
}

interface PekerjaDetailModalProps {
    pekerja: PekerjaItem;
    onClose: (updated?: boolean) => void;
    jabatanOptions: JabatanOption[];
    API_BASE_URL: string;
}

type PekerjaDetailAPI = PekerjaItem & { fotoBase64: string | null };

export default function PekerjaDetailModal({ pekerja, onClose, jabatanOptions, API_BASE_URL }: PekerjaDetailModalProps) {
    const [detailData, setDetailData] = useState<PekerjaDetailAPI | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        nama: pekerja.nama,
        nomor_vest: pekerja.nomor_vest,
        jabatan_id: jabatanOptions.find(j => j.nama_jabatan === pekerja.jabatan)?.id || '',
    });

    // --- 1. FETCH DATA DETAIL ---
    useEffect(() => {
        const fetchDetail = async () => {
            setLoadingDetail(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/pekerja/${pekerja.id_pekerja}`);
                const data: PekerjaDetailAPI = await response.json();
                
                if (response.ok && data) {
                    setDetailData(data);
                    setFormData({
                        nama: data.nama,
                        nomor_vest: data.nomor_vest,
                        jabatan_id: jabatanOptions.find(j => j.nama_jabatan === data.jabatan)?.id || '',
                    });
                } else {
                    setMessage({ type: 'error', text: 'Gagal memuat data detail pekerja.' });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Error jaringan saat memuat detail.' });
            } finally {
                setLoadingDetail(false);
            }
        };
        fetchDetail();
    }, [pekerja.id_pekerja, API_BASE_URL, jabatanOptions]); 

    const cleanBase64 = (base64String: string | null): string | null => {
        if (!base64String) return null;
        if (base64String.startsWith('data:image')) {
            return base64String.split(',')[1];
        }
        return base64String;
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const payload = {
                id_pekerja: pekerja.id_pekerja,
                nama: formData.nama,
                nomor_vest: formData.nomor_vest,
                jabatan: formData.jabatan_id, 
                foto_base64: detailData?.fotoBase64 || 'NO_PHOTO_UPDATE_NEEDED', 
            };

            const response = await fetch(`${API_BASE_URL}/api/pekerja/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: "Data berhasil diperbarui!" });
                setTimeout(() => onClose(true), 1500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal menyimpan perubahan.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error jaringan saat menyimpan.' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!confirm(`Yakin ingin menghapus pekerja ${pekerja.nama}? Data yang dihapus tidak dapat dikembalikan.`)) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pekerja/${pekerja.id_pekerja}`, { method: 'DELETE' });
            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: "Pekerja berhasil dihapus." });
                setTimeout(() => onClose(true), 1000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal menghapus pekerja.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error jaringan saat menghapus.' });
        } finally {
            setLoading(false);
        }
    };

    // Styling helpers
    const inputStyle = `bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-slate-900' : ''}`;
    const labelStyle = "text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2";

    return (
        <Dialog open={true} onOpenChange={() => onClose(false)}>
            <DialogContent className="sm:max-w-[800px] bg-slate-900 border border-slate-700 shadow-2xl p-0 overflow-hidden text-white gap-0">
                
                {/* Header Gradient */}
                <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                Profil Personil
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 mt-1">
                                Detail informasi dan status enrollment biometrik.
                            </DialogDescription>
                        </div>
                        {/* Custom Close Button */}
                        <button onClick={() => onClose(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="p-6">
                    
                    {/* Feedback Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                            <span className="font-medium text-sm">{message.text}</span>
                        </div>
                    )}
                    
                    {loadingDetail ? (
                         <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 text-sm">Mengambil data enkripsi...</p>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Kolom Kiri: Foto & Status */}
                            <div className="md:col-span-1 flex flex-col items-center">
                                <div className="relative group w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                                    <img 
                                        src={detailData?.fotoBase64 
                                            ? `data:image/jpeg;base64,${cleanBase64(detailData.fotoBase64)}` 
                                            : 'https://via.placeholder.com/250/0f172a/334155?text=NO+IMAGE'}
                                        alt={`Wajah ${pekerja.nama}`}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                    {/* Overlay Scan Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <ScanFace className="w-6 h-6 text-blue-400 mb-1" />
                                        <p className="text-[10px] text-slate-400 font-mono">BIOMETRIC DATA</p>
                                    </div>
                                </div>

                                <div className={`mt-4 w-full py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm font-bold ${pekerja.has_face_data ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                    {pekerja.has_face_data ? (
                                        <><CheckCircle className="w-4 h-4" /> TERDAFTAR</>
                                    ) : (
                                        <><AlertTriangle className="w-4 h-4" /> BELUM ENROLL</>
                                    )}
                                </div>
                            </div>

                            {/* Kolom Kanan: Form Data */}
                            <div className="md:col-span-2 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label className={labelStyle}><CreditCard className="w-3.5 h-3.5"/> ID Pekerja</Label>
                                        <Input value={pekerja.id_pekerja} readOnly className="bg-slate-900 border-slate-800 text-slate-400 font-mono" />
                                    </div>
                                    
                                    <div className="col-span-2">
                                        <Label htmlFor="nama" className={labelStyle}><User className="w-3.5 h-3.5"/> Nama Lengkap</Label>
                                        <Input 
                                            id="nama" 
                                            value={formData.nama} 
                                            onChange={handleEditChange} 
                                            readOnly={!isEditing} 
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="nomor_vest" className={labelStyle}><Hash className="w-3.5 h-3.5"/> Nomor Vest</Label>
                                        <Input 
                                            id="nomor_vest" 
                                            value={formData.nomor_vest} 
                                            onChange={handleEditChange} 
                                            readOnly={!isEditing}
                                            type="number"
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="jabatan" className={labelStyle}><Briefcase className="w-3.5 h-3.5"/> Jabatan</Label>
                                        {isEditing ? (
                                            <Select onValueChange={(v) => setFormData({ ...formData, jabatan_id: v })} value={formData.jabatan_id}>
                                                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                                    <SelectValue placeholder="Pilih Jabatan" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                                    {jabatanOptions.map((j) => (
                                                        <SelectItem key={j.id} value={j.id} className="focus:bg-slate-800 cursor-pointer">
                                                            {j.nama_jabatan}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input value={pekerja.jabatan} readOnly className={inputStyle} />
                                        )}
                                    </div>
                                </div>

                                {/* Info Tambahan / Mode Edit Banner */}
                                {isEditing && (
                                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-300 flex items-center gap-2">
                                        <Edit className="w-4 h-4" />
                                        Mode Edit aktif. Silakan ubah data dan klik Simpan.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="p-6 bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={handleDelete} 
                        disabled={loading || isEditing || loadingDetail}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full sm:w-auto justify-start px-0 sm:px-4"
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus Permanen
                    </Button>
                    
                    <div className='flex gap-3 w-full sm:w-auto'>
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading} className="border-slate-600 text-slate-300 hover:bg-slate-800 flex-1 sm:flex-none">
                                    Batal
                                </Button>
                                <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-500 text-white flex-1 sm:flex-none">
                                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> : <Save className="w-4 h-4 mr-2" />}
                                    Simpan
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} disabled={loading || loadingDetail} className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto">
                                <Edit className="w-4 h-4 mr-2" /> Ubah Data
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}