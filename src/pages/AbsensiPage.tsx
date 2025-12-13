"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { 
  CheckCircle, ScanFace, HardHat, Shirt, 
  HandMetal, Footprints, History, Save, Edit, X, Eye, 
  Loader2, Camera, ShieldCheck, AlertTriangle
  // Glasses, Cross, // <-- DI-COMMENT (Icon)
} from "lucide-react";

// --- TYPES ---
type Pekerja = {
  id_pekerja: string;
  nama: string;
  nomor_vest?: number;
  jabatan?: string;
  has_face_data?: boolean;
};

type LogAbsensi = {
  id: number;
  waktu_absen: string;
  pekerja_id: string;
  confidence: number;
  apd_lengkap: boolean;
  is_manual: boolean;
  ocr_result?: string;
  foto_wajah?: string; foto_helm?: string; foto_vest?: string;
  foto_gloves?: string; foto_boots?: string; 
  // foto_glasses?: string; foto_mask?: string; // <-- DI-COMMENT (Type)
  helm_ok: boolean; vest_ok: boolean; gloves_ok: boolean;
  boots_ok: boolean; 
  // glasses_ok: boolean; mask_ok: boolean; // <-- DI-COMMENT (Type)
  Pekerja: { nama: string; Jabatan: { nama_jabatan: string }; };
};

type ScanStep = 
  | "IDLE" | "SCANNING_FACE" | "SCANNING_HELMET" | "SCANNING_VEST" 
  | "SCANNING_GLOVES" | "SCANNING_BOOTS" | "SUCCESS_WAIT";
  // | "SCANNING_GLASSES" | "SCANNING_MASK" // <-- DI-COMMENT (Step)

type FeedbackStatus = "info" | "warning" | "error" | "success";

const NEXT_STEP: Record<string, ScanStep> = {
    "SCANNING_FACE": "SCANNING_HELMET",
    "SCANNING_HELMET": "SCANNING_VEST",
    "SCANNING_VEST": "SCANNING_GLOVES",
    "SCANNING_GLOVES": "SCANNING_BOOTS", // <-- LANGSUNG KE BOOTS (Skip Glasses)
    // "SCANNING_GLASSES": "SCANNING_BOOTS", // <-- DI-COMMENT
    "SCANNING_BOOTS": "SUCCESS_WAIT",    // <-- LANGSUNG SELESAI (Skip Mask)
    // "SCANNING_MASK": "SUCCESS_WAIT"       // <-- DI-COMMENT
};

// --- COMPONENT: DETAIL MODAL ---
function DetailModal({ log, onClose, onUpdate }: { log: LogAbsensi | null, onClose: () => void, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
      helm_ok: false, vest_ok: false, gloves_ok: false, boots_ok: false, 
      // glasses_ok: false, mask_ok: false // <-- DI-COMMENT
  });

  useEffect(() => {
      if (log) {
          setEditData({
              helm_ok: Boolean(log.helm_ok), vest_ok: Boolean(log.vest_ok), gloves_ok: Boolean(log.gloves_ok),
              boots_ok: Boolean(log.boots_ok),
              // glasses_ok: Boolean(log.glasses_ok), mask_ok: Boolean(log.mask_ok) // <-- DI-COMMENT
          });
      }
  }, [log]);

  if (!log) return null;

  const handleSave = async () => {
      try {
          const res = await fetch(`/api/absensi/${log.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(editData)
          });
          if(res.ok) { onUpdate(); setIsEditing(false); alert("Data diperbarui!"); }
      } catch (e) { alert("Gagal update"); }
  };

  const EvidenceItem = ({ label, src, fieldKey }: { label: string, src?: string, fieldKey: keyof typeof editData }) => {
    // @ts-ignore
    const isActive = isEditing ? editData[fieldKey] : log[fieldKey as keyof LogAbsensi];
    return (
      <div className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${isActive ? "border-green-500/30 bg-green-900/10" : "border-red-500/30 bg-red-900/10"}`}>
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            {isEditing ? (
                // @ts-ignore
                <input type="checkbox" checked={editData[fieldKey]} onChange={(e) => setEditData(p => ({...p, [fieldKey]: e.target.checked}))} className="w-4 h-4 accent-green-500 cursor-pointer" />
            ) : (
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isActive ? "bg-green-500 text-black" : "bg-red-500 text-white"}`}>{isActive ? "LENGKAP" : "MISSING"}</span>
            )}
        </div>
        <div className="aspect-square bg-black rounded-lg overflow-hidden border border-slate-700 relative group">
          {src ? (
             <img src={`http://localhost:5005${src}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
             <div className="flex items-center justify-center h-full text-xs text-slate-600">No Image</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-5xl rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{log.Pekerja.nama}</h2>
              <p className="text-slate-400 text-sm">{new Date(log.waktu_absen).toLocaleString('id-ID')}</p>
          </div>
          <div className="flex gap-3">
              {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="text-yellow-400 border-yellow-600/50 hover:bg-yellow-900/20">
                      <Edit className="w-4 h-4 mr-2"/> Koreksi Data
                  </Button>
              ) : (
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white">
                      <Save className="w-4 h-4 mr-2"/> Simpan
                  </Button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X /></button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto bg-slate-900/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Main Face Evidence */}
            <div className="col-span-2 md:col-span-1 row-span-2">
               <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-700 bg-black/40 h-full">
                   <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                       <ScanFace className="w-4 h-4"/> Wajah Identitas
                   </span>
                   <div className="aspect-square bg-black rounded-lg overflow-hidden relative flex-1 border border-slate-800">
                       {log.foto_wajah ? <img src={`http://localhost:5005${log.foto_wajah}`} className="w-full h-full object-cover" /> : null}
                   </div>
                   <div className="text-xs text-slate-500">
                       Confidence: <span className="text-slate-300 font-mono">{(log.confidence).toFixed(1)}%</span>
                   </div>
               </div>
            </div>
            
            <EvidenceItem label="Helm Safety" src={log.foto_helm} fieldKey="helm_ok" />
            <EvidenceItem label="Rompi Vest" src={log.foto_vest} fieldKey="vest_ok" />
            <EvidenceItem label="Sarung Tangan" src={log.foto_gloves} fieldKey="gloves_ok" />
            <EvidenceItem label="Sepatu Safety" src={log.foto_boots} fieldKey="boots_ok" />
            
            {/* DI-COMMENT UI NYA */}
            {/* <EvidenceItem label="Kacamata" src={log.foto_glasses} fieldKey="glasses_ok" /> */}
            {/* <EvidenceItem label="Masker" src={log.foto_mask} fieldKey="mask_ok" /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- COMPONENT: BOUNDING BOX ---
function BoundingBoxOverlay({ predictions, step, isMirrored }: { predictions: any[], step: ScanStep, isMirrored: boolean }) {
  if (!predictions || predictions.length === 0) return null;
  const targetClasses: string[] = [];
  if (step === "SCANNING_HELMET") targetClasses.push('0', 'helmet');
  if (step === "SCANNING_VEST") targetClasses.push('3', 'vest');
  if (step === "SCANNING_GLOVES") targetClasses.push('8', 'gloves');
  if (step === "SCANNING_BOOTS") targetClasses.push('9', 'boots');
  
  // DI-COMMENT
  // if (step === "SCANNING_GLASSES") targetClasses.push('6', 'glasses');
  // if (step === "SCANNING_MASK") targetClasses.push('4', 'mask');
  
  if (step === "SUCCESS_WAIT") targetClasses.push('all');

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {predictions.map((pred, idx) => {
        const cls = String(pred.class).toLowerCase();
        const isTarget = targetClasses.includes('all') || targetClasses.some(t => cls.includes(t));
        if (!isTarget) return null;
        
        const { x, y, w, h } = pred.box; 
        let left = (x - w / 2) * 100; const top = (y - h / 2) * 100; const width = w * 100; const height = h * 100;
        if (isMirrored) left = 100 - (left + width);
        
        let colorClass = "border-white/50 bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.2)]";
        if (cls.includes('helmet')) colorClass = "border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
        else if (cls.includes('vest')) colorClass = "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.3)]";
        
        return <div key={idx} className={`absolute border-2 rounded transition-all duration-100 ${colorClass}`} style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }} />;
      })}
    </div>
  );
}

// --- COMPONENT: UI HELPERS ---
function APDItem({ label, active, current, icon }: any) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-300 ${
        active 
        ? "bg-green-900/30 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
        : current 
            ? "bg-blue-900/20 border-blue-500/60 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
            : "bg-slate-800/30 border-slate-700/50 opacity-50"
    }`}>
      <div className="flex items-center gap-3">
          <span className={active ? "text-green-400" : current ? "text-blue-400" : "text-slate-500"}>{icon}</span>
          <span className={`text-sm ${active ? "font-bold text-white" : current ? "font-medium text-blue-100" : "text-slate-400"}`}>{label}</span>
      </div>
      {active ? <CheckCircle className="w-5 h-5 text-green-500" /> : current ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <span className="text-[10px] text-slate-600 font-mono">WAITING</span>}
    </div>
  )
}

function StatusItem({ label, active, text, icon }: any) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${active ? "bg-green-900/20 border-green-500/50 shadow-lg" : "bg-slate-900/50 border-slate-800"}`}>
      <div className={`p-2 rounded-full ${active ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-500"}`}>{icon}</div>
      <div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</div>
          <div className={`text-lg font-bold truncate max-w-[150px] ${active?"text-green-400 drop-shadow-sm":"text-slate-500"}`}>{text}</div>
      </div>
    </div>
  )
}

// --- MAIN PAGE ---
export default function AbsensiPage() {
  const [pekerja, setPekerja] = useState<Pekerja[]>([]);
  const [logs, setLogs] = useState<LogAbsensi[]>([]); 
  const [scanStep, setScanStep] = useState<ScanStep>("IDLE");
  const scanStepRef = useRef<ScanStep>("IDLE");
  
  // REFS
  const detectedNameRef = useRef<string>("");
  const matchedIdRef = useRef<string>("");
  const matchedConfidenceRef = useRef<number>(0);
  const checklistRef = useRef({
    face: false, helmet: false, vest: false, gloves: false, boots: false, ocr_match: false
    // glasses: false, mask: false, // <-- DI-COMMENT (Ref)
  });
  const imagesRef = useRef({
    face: null as string | null, helmet: null as string | null, vest: null as string | null,
    gloves: null as string | null, boots: null as string | null,
    // glasses: null as string | null, mask: null as string | null // <-- DI-COMMENT (Ref)
  });

  // State UI
  const [, setForceUpdate] = useState(0); 
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>("info");
  const [targetVestNumber, setTargetVestNumber] = useState<string>(""); 
  const [showCamera, setShowCamera] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogAbsensi | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const shouldContinueRef = useRef(false);
  const stepTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchWorkers();
    fetchTodayLogs();
    return () => stopCamera();
  }, []);

  async function fetchWorkers() { try { const r = await fetch("/api/pekerja"); setPekerja(await r.json() || []); } catch (e) { console.error(e); } }
  async function fetchTodayLogs() { try { const r = await fetch("/api/absensi/today"); setLogs(await r.json() || []); } catch (e) { console.error(e); } }

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (v.videoWidth === 0) return null;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    return c.toDataURL("image/jpeg", 0.7);
  };

  const updateScanStep = (newStep: ScanStep) => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    setScanStep(newStep);
    scanStepRef.current = newStep;

    const apdSteps = ["SCANNING_HELMET", "SCANNING_VEST", "SCANNING_GLOVES", "SCANNING_BOOTS"];
    // "SCANNING_GLASSES", "SCANNING_MASK" // <-- DI-COMMENT (List)
    
    if (apdSteps.includes(newStep)) {
        stepTimeoutRef.current = setTimeout(() => {
            handleStepTimeout(newStep);
        }, 8000) as unknown as number; 
    }
  };

  const handleStepTimeout = (stuckStep: ScanStep) => {
    if (!shouldContinueRef.current) return;
    const failSnap = takeSnapshot();
    const keyMap: Record<string, string> = {
        "SCANNING_HELMET": "helmet", "SCANNING_VEST": "vest", "SCANNING_GLOVES": "gloves",
        "SCANNING_BOOTS": "boots",
        // "SCANNING_GLASSES": "glasses", "SCANNING_MASK": "mask" // <-- DI-COMMENT
    };
    const key = keyMap[stuckStep];
    if (key) {
        // @ts-ignore
        imagesRef.current[key] = failSnap;
    }
    const next = NEXT_STEP[stuckStep];
    if (next) {
        updateScanStep(next);
        setFeedbackMsg(`⚠️ Waktu Habis! ${stuckStep.replace("SCANNING_", "")} Skip...`);
        setFeedbackStatus("error");
        
        // DI-COMMENT karena mask sudah diskip
        // if (stuckStep === "SCANNING_MASK") {
        //       setTimeout(() => finalizeLog(), 500);
        // }
        
        // JIKA STUCK DI BOOTS (STEP TERAKHIR), FINALIZE
        if (stuckStep === "SCANNING_BOOTS") {
               setTimeout(() => finalizeLog(), 500);
        }
    }
  };

  async function finalizeLog() {
    const finalId = matchedIdRef.current;
    const chk = checklistRef.current;
    const imgs = imagesRef.current;
    if (!finalId) return;

    try {
      await fetch("/api/absensi", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pekerja_id: finalId,
          confidence: matchedConfidenceRef.current || 100,
          helm_ok: chk.helmet, vest_ok: chk.vest, gloves_ok: chk.gloves,
          boots_ok: chk.boots, 
          // glasses_ok: chk.glasses, mask_ok: chk.mask, // <-- DI-COMMENT
          ocr_result: result?.vest_ocr?.vest_number,
          is_manual: false,
          foto_wajah: imgs.face, foto_helm: imgs.helmet, foto_vest: imgs.vest,
          foto_gloves: imgs.gloves, foto_boots: imgs.boots, 
          // foto_glasses: imgs.glasses, foto_mask: imgs.mask // <-- DI-COMMENT
        })
      });
      updateScanStep("SUCCESS_WAIT");
      setFeedbackMsg(`✅ DATA TERSIMPAN!`);
      setFeedbackStatus("success");
      fetchTodayLogs();
      setTimeout(() => {
          if (shouldContinueRef.current) { resetToFaceScan(); runVerificationLoop(); }
      }, 3000);
    } catch (e) { console.error(e); }
  }

  function resetToFaceScan() {
    updateScanStep("SCANNING_FACE");
    detectedNameRef.current = ""; matchedIdRef.current = "";
    setTargetVestNumber("");
    
    // @ts-ignore (Mengabaikan glasses/mask yang hilang dari tipe sementara)
    checklistRef.current = { face: false, helmet: false, vest: false, gloves: false, boots: false, ocr_match: false };
    // @ts-ignore
    imagesRef.current = { face: null, helmet: null, vest: null, gloves: null, boots: null };
    
    setForceUpdate(n => n + 1); 
    setFeedbackMsg("Mencari wajah...");
    setFeedbackStatus("info");
    setResult(null);
  }

  function evaluateResult(data: any) {
    setResult(data); 
    const faceOk = data.face?.match === true;
    
    if (scanStepRef.current === "SCANNING_FACE" && data.face?.best_match_key && faceOk) {
        const mId = String(data.face.best_match_key);
        const p = pekerja.find(x => String(x.id_pekerja) === mId);
        const name = p ? p.nama : mId;
        matchedIdRef.current = mId;
        matchedConfidenceRef.current = data.face.best_match_percent;
        detectedNameRef.current = name;
        if (p?.nomor_vest) setTargetVestNumber(String(p.nomor_vest));
    }

    const currentSnap = takeSnapshot();
    const chk = checklistRef.current;
    let stateChanged = false;

    const updateItem = (key: keyof typeof chk, isDetected: boolean) => {
        // @ts-ignore
        if (!chk[key] && isDetected) {
            // @ts-ignore
            chk[key] = true;
            // @ts-ignore
            imagesRef.current[key] = currentSnap; 
            stateChanged = true;
        }
    };

    updateItem('face', faceOk);
    updateItem('helmet', data.ppe?.helmet_detected);
    updateItem('vest', data.ppe?.vest_detected);
    updateItem('gloves', data.ppe?.gloves_detected);
    updateItem('boots', data.ppe?.boots_detected);
    
    // DI-COMMENT
    // updateItem('glasses', data.ppe?.glasses_detected);
    // updateItem('mask', data.ppe?.mask_detected);

    if (stateChanged) setForceUpdate(n => n + 1); 

    const step = scanStepRef.current;

    if (step === "SCANNING_FACE" && chk.face) {
        updateScanStep("SCANNING_HELMET");
        setFeedbackMsg(`Halo ${detectedNameRef.current}! Cek Helm...`);
        setFeedbackStatus("success");
    }
    else if (step === "SCANNING_HELMET" && chk.helmet) {
        updateScanStep("SCANNING_VEST");
        setFeedbackMsg("Helm OK! Cek Rompi...");
        setFeedbackStatus("success");
    }
    else if (step === "SCANNING_VEST" && chk.vest) {
        updateScanStep("SCANNING_GLOVES");
        setFeedbackMsg("Rompi OK! Cek Sarung Tangan...");
        setFeedbackStatus("success");
    }
    else if (step === "SCANNING_GLOVES" && chk.gloves) {
        // LANGSUNG KE BOOTS (Skip Glasses)
        updateScanStep("SCANNING_BOOTS");
        setFeedbackMsg("Sarung Tangan OK! Cek Sepatu...");
        setFeedbackStatus("success");
    }
    // else if (step === "SCANNING_GLASSES" && chk.glasses) { ... } // DI-COMMENT
    else if (step === "SCANNING_BOOTS" && chk.boots) {
        // LANGSUNG SELESAI (Skip Mask)
        updateScanStep("SUCCESS_WAIT");
        setFeedbackMsg(`✅ SEMUA LENGKAP!`);
        setFeedbackStatus("success");
        setTimeout(() => finalizeLog(), 100); 
    }
    // else if (step === "SCANNING_MASK" && chk.mask) { ... } // DI-COMMENT
  }

  async function startCamera() {
    try {
      if(pekerja.length === 0) {
          const r = await fetch("/api/pekerja"); 
          const data = await r.json();
          setPekerja(data || []);
      }
      setResult(null); updateScanStep("IDLE"); setFeedbackMsg(""); setShowCamera(true);
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = devices.find(d => d.kind === 'videoinput') || devices[0];
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDevice.deviceId, width: 640, height: 480 } });
      setMediaStream(stream);
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch (e) { alert("Gagal kamera: " + e); setShowCamera(false); }
  }

  function stopCamera() {
    shouldContinueRef.current = false;
    if (mediaStream) mediaStream.getTracks().forEach((t: any) => t.stop());
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    updateScanStep("IDLE");
  }

  async function startAutoScan() {
    shouldContinueRef.current = true;
    resetToFaceScan();
    runVerificationLoop();
  }

  async function runVerificationLoop() {
    if (!shouldContinueRef.current) return;
    if (scanStepRef.current === "SUCCESS_WAIT") return;

    const frames = await captureBurstFrames(800);
    if (frames.length === 0) {
      if(shouldContinueRef.current) requestAnimationFrame(runVerificationLoop);
      return;
    }

    try {
      const currentMode = scanStepRef.current === "SCANNING_FACE" ? "face" : "ppe";
      const response = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, mode: currentMode })
      });
      const data = await response.json();
      evaluateResult(data);
    } catch (err) { console.error(err); } 
    finally {
      if (shouldContinueRef.current && scanStepRef.current !== "SUCCESS_WAIT") {
        setTimeout(() => runVerificationLoop(), 100);
      }
    }
  }

  function captureBurstFrames(durationMs: number): Promise<string[]> {
    return new Promise((resolve) => {
        if (!videoRef.current || !canvasRef.current) { resolve([]); return; }
        const frames: string[] = [];
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > durationMs || !shouldContinueRef.current) {
                clearInterval(interval); resolve(frames); return;
            }
            const v = videoRef.current!; const c = canvasRef.current!;
            if (v.videoWidth === 0) return;
            c.width = v.videoWidth; c.height = v.videoHeight;
            const ctx = c.getContext("2d");
            if (ctx) {
                ctx.drawImage(v, 0, 0, c.width, c.height);
                frames.push(c.toDataURL("image/jpeg", 0.6).split(",")[1]);
            }
        }, 150);
    });
  }

  return (
    <div className="mx-auto max-w-9xl px-6 mt-30 pb-20 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-3">
               <History className="w-8 h-8 text-blue-500" /> Absensi & Kepatuhan APD
            </h1>
            <p className="text-slate-400 text-sm mt-1 ml-11">Sistem pengecekan otomatis kelengkapan APD berbasis AI.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={startCamera} className="bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/30 text-white font-bold transition-all px-6">
             <Camera className="w-4 h-4 mr-2" /> Mulai Scan Absensi
          </Button>
          <Link to="/pekerja">
             <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                 Database Pekerja
             </Button>
          </Link>
        </div>
      </div>

      {/* CARD RIWAYAT */}
      <Card className="p-0 bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Riwayat Scan Hari Ini
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Total: {logs.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs">
                <tr>
                    <th className="p-4 font-bold">Waktu</th>
                    <th className="p-4 font-bold">Nama Personil</th>
                    <th className="p-4 font-bold">Jabatan</th>
                    <th className="p-4 font-bold">Status Kepatuhan</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">Belum ada data absensi hari ini.</td>
                  </tr>
              ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setSelectedLog(log)}>
                      <td className="p-4 font-mono text-slate-400">{new Date(log.waktu_absen).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-4 font-bold text-white group-hover:text-blue-400 transition-colors">{log.Pekerja.nama}</td>
                      <td className="p-4 text-slate-400">{log.Pekerja.Jabatan?.nama_jabatan || "-"}</td>
                      <td className="p-4">
                          {log.apd_lengkap ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                  <CheckCircle className="w-3 h-3" /> LENGKAP
                              </span>
                          ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                  <AlertTriangle className="w-3 h-3" /> TIDAK LENGKAP
                              </span>
                          )}
                      </td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white hover:bg-blue-600/20 h-8">
                            <Eye className="w-4 h-4 mr-1"/> Detail
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- MODAL CAMERA LIVE SCAN --- */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-slate-900 rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl flex flex-col md:flex-row h-[90vh]">
            
            {/* Panel Kiri: Video */}
            <div className="relative w-full md:w-3/4 bg-black flex items-center justify-center overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover aspect-[4/3] scale-x-[-1]" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              
              <BoundingBoxOverlay predictions={result?.ppe?.predictions} step={scanStep} isMirrored={true} />
              
              {/* Feedback Overlay */}
              {scanStep !== "IDLE" && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30 px-6">
                  <div className={`backdrop-blur-xl px-8 py-4 rounded-2xl font-bold border-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all duration-300 transform scale-105 ${
                      feedbackStatus === 'success' ? "bg-green-600/80 border-green-400 text-white" : 
                      feedbackStatus === 'warning' ? "bg-yellow-600/80 border-yellow-400 text-white" : 
                      feedbackStatus === 'error' ? "bg-red-600/80 border-red-400 text-white" : 
                      "bg-blue-600/80 border-blue-400 text-white"
                  }`}>
                    {feedbackStatus === 'info' && <Loader2 className="w-6 h-6 animate-spin" />}
                    <span className="text-xl tracking-wide drop-shadow-md">{feedbackMsg || "Menunggu..."}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Kanan: Sidebar Status */}
            <div className="w-full md:w-1/4 p-6 flex flex-col bg-slate-900/90 border-l border-white/10 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ScanFace className="w-5 h-5 text-blue-400" /> Status Scan
                  </h2>
                  <button onClick={()=>{setShowCamera(false);stopCamera()}} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors">
                      <X className="w-6 h-6" />
                  </button>
              </div>

              <div className="space-y-3 flex-1">
                {/* Identitas Card */}
                <StatusItem 
                    label="IDENTITAS PERSONIL" 
                    active={checklistRef.current.face} 
                    text={checklistRef.current.face ? detectedNameRef.current : "Mencari Wajah..."} 
                    icon={<ScanFace className="w-6 h-6" />} 
                />
                
                {checklistRef.current.face && targetVestNumber && (
                    <div className="p-3 rounded-lg border text-xs flex justify-between items-center bg-slate-800 border-slate-700 text-slate-300">
                        <span className="font-bold text-slate-500">TARGET VEST ID</span>
                        <span className="font-mono text-lg text-white font-bold">{targetVestNumber}</span>
                    </div>
                )}
                
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />
                
                {/* APD Checklist */}
                <div className="space-y-2">
                    <APDItem label="1. Helm Safety" active={checklistRef.current.helmet} current={scanStep==="SCANNING_HELMET"} icon={<HardHat />} />
                    <APDItem label="2. Rompi Vest" active={checklistRef.current.vest} current={scanStep==="SCANNING_VEST"} icon={<Shirt />} />
                    <APDItem label="3. Sarung Tangan" active={checklistRef.current.gloves} current={scanStep==="SCANNING_GLOVES"} icon={<HandMetal />} />
                    <APDItem label="4. Sepatu Safety" active={checklistRef.current.boots} current={scanStep==="SCANNING_BOOTS"} icon={<Footprints />} />
                    
                    {/* DI-COMMENT UI NYA */}
                    {/* <APDItem label="4. Kacamata" active={checklistRef.current.glasses} current={scanStep==="SCANNING_GLASSES"} icon={<Glasses />} /> */}
                    {/* <APDItem label="6. Masker" active={checklistRef.current.mask} current={scanStep==="SCANNING_MASK"} icon={<Cross />} /> */}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                 {scanStep === "IDLE" ? (
                      <Button onClick={startAutoScan} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 text-lg shadow-lg shadow-blue-500/20">
                          MULAI SCAN
                      </Button>
                 ) : (
                      <div className="text-center text-xs text-slate-500 animate-pulse">
                          Proses scanning sedang berjalan...
                      </div>
                 )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} onUpdate={fetchTodayLogs} />
    </div>
  );
}