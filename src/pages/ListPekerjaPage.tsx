// src/pages/PekerjaListPage.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
    Eye, Plus, ArrowLeft, Users, Search, 
    ShieldCheck, ShieldAlert, Briefcase, User 
} from 'lucide-react'; 

// Import komponen modal (Pastikan path-nya benar sesuai project kamu)
import PekerjaDetailModal from '@/components/DetailPekerja'; 

const API_BASE_URL = "http://localhost:5005";

type PekerjaItem = {
    id_pekerja: string;
    nama: string;
    nomor_vest: string;  
    jabatan: string; 
    is_active: boolean;
    has_face_data: boolean;
};

// State tambahan untuk detail modal
type SelectedPekerja = PekerjaItem & { fotoUrlPlaceholder?: string }; 

export default function PekerjaListPage() {
    const [pekerjaList, setPekerjaList] = useState<PekerjaItem[]>([]);
    const [filteredList, setFilteredList] = useState<PekerjaItem[]>([]); // State untuk hasil search
    const [searchQuery, setSearchQuery] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPekerja, setSelectedPekerja] = useState<SelectedPekerja | null>(null);
    
    // Data jabatan untuk dropdown edit
    const [jabatanOptions, setJabatanOptions] = useState<{ id: string, nama_jabatan: string }[]>([]);

    const fetchPekerjaList = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pekerja`);
            if (!response.ok) throw new Error("Gagal mengambil data pekerja.");
            
            const data: PekerjaItem[] = await response.json();
            setPekerjaList(data);
            setFilteredList(data); // Init filtered list
        } catch (err: any) {
            console.error(err);
            setError("Gagal memuat daftar pekerja. Pastikan backend berjalan.");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchJabatanOptions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jabatan`);
            const data = await response.json();
            setJabatanOptions(data.map((j: any) => ({ ...j, id: String(j.id) })));
        } catch (err) {
            console.error("Gagal memuat opsi jabatan:", err);
        }
    }

    useEffect(() => {
        fetchPekerjaList();
        fetchJabatanOptions();
    }, []);

    // Logic Search Client-side
    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        const filtered = pekerjaList.filter(p => 
            p.nama.toLowerCase().includes(lowerQ) || 
            (p.nomor_vest && String(p.nomor_vest).includes(lowerQ)) ||
            p.jabatan.toLowerCase().includes(lowerQ)
        );
        setFilteredList(filtered);
    }, [searchQuery, pekerjaList]);

    const handleViewDetail = async (pekerja: PekerjaItem) => {
        // Placeholder logic jika nanti ada foto real
        const fotoUrlPlaceholder = ""; 
        setSelectedPekerja({ ...pekerja, fotoUrlPlaceholder });
    };

    const handleCloseModal = (updated?: boolean) => {
        setSelectedPekerja(null);
        if (updated === true) {
            fetchPekerjaList();
        }
    }

    return (
        <div className="mx-auto max-w-9xl px-6 mt-30 pb-20 min-h-screen">
            
            {/* Modal Detail */}
            {selectedPekerja && (
                <PekerjaDetailModal 
                    pekerja={selectedPekerja}
                    onClose={handleCloseModal}
                    jabatanOptions={jabatanOptions}
                    API_BASE_URL={API_BASE_URL}
                />
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            Database Personil
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm ml-11">Kelola data pekerja, jabatan, dan status enrollment wajah.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link to="/jabatan-manager">
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                            <Briefcase className="w-4 h-4 mr-2" /> Kelola Jabatan
                        </Button>
                    </Link>
                    <Link to="/pekerja/add">
                        <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Personil
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-lg">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Cari nama, jabatan, atau nomor vest..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>
                <div className="flex items-center gap-4 px-4 border-l border-slate-700 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>Total: <b className="text-white">{pekerjaList.length}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span>Enrolled: <b className="text-white">{pekerjaList.filter(p => p.has_face_data).length}</b></span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-center">
                    {error}
                </div>
            )}
            
            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-64 bg-slate-800/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                /* Card Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredList.map((pekerja) => (
                        <div 
                            key={pekerja.id_pekerja} 
                            className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:bg-slate-800/60 hover:-translate-y-1 transition-all duration-300 shadow-xl"
                        >
                            {/* Gradient Header pada Card */}
                            <div className="h-20 bg-gradient-to-br from-slate-800 to-slate-900/50 relative">
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${pekerja.is_active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                        {pekerja.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>

                            {/* Avatar & Content */}
                            <div className="px-5 pb-5 relative">
                                {/* Avatar Circle */}
                                <div className="-mt-12 mb-3 flex justify-center">
                                    <div className="w-20 h-20 rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold tracking-widest shadow-inner">
                                            {pekerja.nama.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Info */}
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                        {pekerja.nama}
                                    </h3>
                                    <p className="text-xs text-blue-300/80 uppercase tracking-wide font-medium mb-4">
                                        {pekerja.jabatan}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-5">
                                        <div className="bg-slate-950/50 rounded-lg p-2 border border-white/5">
                                            <p className="text-[10px] text-slate-500 uppercase">No. Vest</p>
                                            <p className="font-mono font-bold text-slate-200 text-sm">
                                                {(pekerja as any).nomor_vest || '-'}
                                            </p>
                                        </div>
                                        <div className={`rounded-lg p-2 border ${pekerja.has_face_data ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
                                            <p className="text-[10px] text-slate-500 uppercase">Biometrik</p>
                                            <div className="flex items-center justify-center gap-1 mt-0.5">
                                                {pekerja.has_face_data ? (
                                                    <>
                                                        <ShieldCheck className="w-3 h-3 text-green-400" />
                                                        <span className="text-xs font-bold text-green-400">Siap</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldAlert className="w-3 h-3 text-red-400" />
                                                        <span className="text-xs font-bold text-red-400">Kosong</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        className="w-full border-slate-700 bg-slate-800/50 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-slate-300 transition-all"
                                        onClick={() => handleViewDetail(pekerja)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" /> Detail Profil
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredList.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <User className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-400">Tidak ada data ditemukan</h3>
                    <p className="text-slate-500">Coba kata kunci lain atau tambahkan pekerja baru.</p>
                </div>
            )}
        </div>
    );
}