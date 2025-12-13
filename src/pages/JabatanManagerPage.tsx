import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    Trash2, Pencil, Plus, ArrowLeft, Briefcase, 
    CheckCircle, AlertTriangle, Save, X, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = "http://localhost:5005";

type Jabatan = {
    id: string;
    nama_jabatan: string;
}

export default function JabatanManagerPage() {
    const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputNama, setInputNama] = useState('');
    
    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingNama, setEditingNama] = useState('');
    
    // Feedback State
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchJabatan = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jabatan`);
            if (!response.ok) throw new Error("Gagal mengambil data jabatan.");
            
            const data: { id: number, nama_jabatan: string }[] = await response.json();
            setJabatanList(data.map(j => ({ ...j, id: String(j.id) })));
            
        } catch (err) {
            setMessage({type: 'error', text: 'Gagal terhubung ke server. Pastikan backend berjalan.'});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJabatan();
    }, []);

    const handleMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    // --- CRUD HANDLERS ---
    const handleAddJabatan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputNama.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jabatan/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_jabatan: inputNama.trim() }),
            });

            const result = await response.json();

            if (response.ok) {
                handleMessage('success', result.message);
                setInputNama('');
                fetchJabatan();
            } else {
                handleMessage('error', result.message);
            }
        } catch (error) {
            handleMessage('error', 'Error jaringan saat menambah jabatan.');
        }
    };

    const handleUpdateJabatan = async (id: string) => {
        if (!editingNama.trim()) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/jabatan/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_jabatan: editingNama.trim() }),
            });

            const result = await response.json();

            if (response.ok) {
                handleMessage('success', result.message);
                setEditingId(null);
                fetchJabatan();
            } else {
                handleMessage('error', result.message);
            }
        } catch (error) {
            handleMessage('error', 'Error jaringan saat update.');
        }
    };

    const handleDeleteJabatan = async (id: string) => {
        if (!confirm(`Hapus jabatan ini? User dengan jabatan ini mungkin akan kehilangan referensi jabatannya.`)) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/jabatan/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (response.ok) {
                handleMessage('success', result.message);
                fetchJabatan();
            } else {
                handleMessage('error', result.message);
            }
        } catch (error) {
            handleMessage('error', 'Error jaringan saat menghapus.');
        }
    };

    const startEditing = (jabatan: Jabatan) => {
        setEditingId(jabatan.id);
        setEditingNama(jabatan.nama_jabatan);
    };

    return (
        <div className="mx-auto max-w-9xl px-6 mt-30 mb-20 min-h-screen">
            
            {/* Header Section */}
            <div className="mb-8">
                <Link to="/pekerja" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pekerja
                </Link>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-blue-500" /> Manajemen Jabatan
                </h1>
                <p className="text-slate-400 text-sm mt-1 ml-11">Atur struktur organisasi dan role pekerjaan.</p>
            </div>
            
            {/* Feedback Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Kolom 1: Tambah Jabatan (Input Terminal) */}
                <div className="lg:col-span-1">
                    <Card className="bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl sticky top-24">
                        <CardHeader className="border-b border-white/5 bg-slate-900/50">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" /> Tambah Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleAddJabatan} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nama Jabatan</label>
                                    <Input 
                                        placeholder="Contoh: Supervisor, Staff IT..."
                                        value={inputNama}
                                        onChange={(e) => setInputNama(e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all">
                                    <Plus className="w-4 h-4 mr-2" /> Simpan Jabatan
                                </Button>
                                <p className="text-[10px] text-slate-500 text-center mt-2">
                                    Data jabatan akan muncul di dropdown saat registrasi pekerja.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Kolom 2: Daftar Jabatan (Data Grid) */}
                <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden h-fit">
                    <CardHeader className="border-b border-white/5 bg-slate-900/50 flex flex-row justify-between items-center py-4">
                        <CardTitle className="text-lg text-white">Daftar Jabatan Aktif</CardTitle>
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                            Total: {jabatanList.length}
                        </span>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                <p className="text-sm text-slate-500">Memuat data...</p>
                            </div>
                        ) : jabatanList.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Belum ada data jabatan.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-950">
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead className="w-20 text-slate-400 font-bold">ID</TableHead>
                                        <TableHead className="text-slate-400 font-bold">Nama Jabatan</TableHead>
                                        <TableHead className="text-right text-slate-400 font-bold w-[140px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jabatanList.map((j) => (
                                        <TableRow key={j.id} className="border-slate-800/50 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-mono text-slate-500 text-xs">{j.id}</TableCell>
                                            <TableCell>
                                                {editingId === j.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            value={editingNama}
                                                            onChange={(e) => setEditingNama(e.target.value)}
                                                            className="h-8 bg-slate-950 border-blue-500 text-white"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateJabatan(j.id);
                                                                if (e.key === 'Escape') setEditingId(null);
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-200 font-medium">{j.nama_jabatan}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingId === j.id ? (
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-500" onClick={() => handleUpdateJabatan(j.id)} title="Simpan">
                                                            <Save className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-white/10 text-slate-400" onClick={() => setEditingId(null)} title="Batal">
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-1 opacity-70 hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-white hover:bg-blue-500/20" onClick={() => startEditing(j)} title="Edit">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-white hover:bg-red-500/20" onClick={() => handleDeleteJabatan(j.id)} title="Hapus">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}