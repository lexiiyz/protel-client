import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { 
    ArrowLeft, Upload, ScanFace, CheckCircle, 
    AlertTriangle, User, Hash, Briefcase, CreditCard, Save 
} from "lucide-react";

const API_BASE_URL = "http://localhost:5005";

type JabatanOption = {
    id: number;
    nama_jabatan: string;
}

export default function AddPekerjaPage() {
    const navigate = useNavigate();
    const [jabatanOptions, setJabatanOptions] = useState<JabatanOption[]>([]);
    const [formData, setFormData] = useState({
        id_pekerja: '',
        nama: '',
        nomor_vest: '',
        jabatan_id: '', 
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoBase64, setPhotoBase64] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loadingJabatan, setLoadingJabatan] = useState(true);

    // --- Ambil Data Jabatan ---
    useEffect(() => {
        const fetchJabatan = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jabatan`);
                if (!response.ok) throw new Error("Gagal memuat jabatan.");
                const data: JabatanOption[] = await response.json();
                setJabatanOptions(data);
            } catch (err) {
                console.error("Error fetching jabatan:", err);
                setMessage({type: 'error', text: 'Gagal memuat daftar jabatan dari server.'});
            } finally {
                setLoadingJabatan(false);
            }
        };
        fetchJabatan();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (value: string) => {
        setFormData({ ...formData, jabatan_id: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                setPhotoBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
            setPhotoBase64(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!photoBase64 || !formData.jabatan_id) {
            setMessage({ type: 'error', text: 'Wajib menyertakan foto wajah dan memilih jabatan.' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                id_pekerja: formData.id_pekerja,
                nama: formData.nama,
                nomor_vest: formData.nomor_vest,
                jabatan: formData.jabatan_id,
                foto_base64: photoBase64,
            };

            const response = await fetch(`${API_BASE_URL}/api/pekerja/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && response.status === 201) {
                setMessage({ type: 'success', text: "Registrasi Berhasil! Mengalihkan..." });
                setTimeout(() => navigate('/pekerja'), 2000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal menyimpan data.' });
            }

        } catch (error) {
            console.error("Submission Error:", error);
            setMessage({ type: 'error', text: 'Terjadi error jaringan saat menambahkan pekerja.' });
        } finally {
            setSubmitting(false);
        }
    };

    // Styling input yang reusable
    const inputClasses = "bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";
    const labelClasses = "text-slate-400 text-sm font-medium mb-1.5 flex items-center gap-2";

    return (
        <div className="mx-auto max-w-9xl px-6 mt-30 mb-20 min-h-screen">
            
            {/* Header */}
            <div className="mb-8">
                <Link to="/pekerja" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
                </Link>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    Registrasi Personil Baru
                </h1>
                <p className="text-slate-400 text-sm mt-1">Input data administrasi dan enrollment biometrik wajah.</p>
            </div>

            <Card className="bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-0">
                    
                    {/* Feedback Message */}
                    {message && (
                        <div className={`p-4 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border-b border-green-500/30' : 'bg-red-500/20 text-red-300 border-b border-red-500/30'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                        
                        {/* Kiri: Form Data (3 Col) */}
                        <div className="lg:col-span-3 p-8 space-y-6 border-r border-white/5">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" /> Data Administratif
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="id_pekerja" className={labelClasses}>
                                        <CreditCard className="w-3.5 h-3.5" /> ID Pekerja / NIK
                                    </Label>
                                    <Input 
                                        id="id_pekerja" 
                                        placeholder="Contoh: PKJ-001" 
                                        value={formData.id_pekerja} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputClasses}
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">*Harus unik, tidak boleh sama dengan pekerja lain.</p>
                                </div>

                                <div>
                                    <Label htmlFor="nama" className={labelClasses}>
                                        <User className="w-3.5 h-3.5" /> Nama Lengkap
                                    </Label>
                                    <Input 
                                        id="nama" 
                                        placeholder="Nama sesuai identitas" 
                                        value={formData.nama} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputClasses}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nomor_vest" className={labelClasses}>
                                            <Hash className="w-3.5 h-3.5" /> Nomor Vest
                                        </Label>
                                        <Input 
                                            id="nomor_vest" 
                                            type="number" 
                                            placeholder="01" 
                                            value={formData.nomor_vest} 
                                            onChange={handleChange} 
                                            required 
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="jabatan_id" className={labelClasses}>
                                            <Briefcase className="w-3.5 h-3.5" /> Jabatan
                                        </Label>
                                        <Select onValueChange={handleSelectChange} value={formData.jabatan_id} required disabled={loadingJabatan}>
                                            <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white">
                                                <SelectValue placeholder={loadingJabatan ? "Loading..." : "Pilih Jabatan"} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                                {jabatanOptions.map((jabatan) => (
                                                    <SelectItem key={jabatan.id} value={String(jabatan.id)} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                                        {jabatan.nama_jabatan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kanan: Biometrik Upload (2 Col) */}
                        <div className="lg:col-span-2 p-8 bg-slate-950/30 flex flex-col items-center justify-center relative">
                             {/* Dekorasi Garis */}
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <ScanFace className="w-24 h-24 text-blue-500" />
                            </div>

                            <h2 className="text-lg font-semibold text-white mb-6 w-full flex items-center gap-2">
                                <ScanFace className="w-5 h-5 text-blue-500" /> Enrollment Wajah
                            </h2>

                            <div className="w-full">
                                <label 
                                    htmlFor="photo-upload" 
                                    className={`group relative w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${photoPreview ? 'border-blue-500/50 bg-slate-900' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-900/50'}`}
                                >
                                    <Input 
                                        id="photo-upload" 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        accept="image/jpeg, image/png" 
                                        className="hidden" 
                                    />
                                    
                                    {photoPreview ? (
                                        <>
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                            {/* Overlay Scan Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg font-bold tracking-wider">
                                                    WAJAH TERDETEKSI
                                                </span>
                                            </div>
                                            {/* Change Overlay */}
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="text-white flex flex-col items-center">
                                                    <Upload className="w-8 h-8 mb-2" />
                                                    <span className="text-sm font-bold">Ganti Foto</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600/20 transition-colors">
                                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                                            </div>
                                            <p className="text-slate-300 font-medium mb-1">Upload Foto Wajah</p>
                                            <p className="text-xs text-slate-500">Format: JPG/PNG. Pastikan wajah terlihat jelas tanpa masker.</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end gap-4">
                        <Link to="/pekerja">
                            <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                                Batal
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 shadow-lg shadow-blue-500/20"
                            disabled={submitting || loadingJabatan}
                        >
                            {submitting ? (
                                <>Memproses...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Simpan & Daftarkan</>
                            )}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}