import React, { useEffect, useRef, useState } from "react";
// @ts-ignore (JSMpeg kadang tidak punya type definition resmi)
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { AlertTriangle, Loader2, VideoOff } from "lucide-react";

type SmartCCTVProps = {
  camera: {
    id: number;
    name: string;
    type: string; // "RTSP" | "WEBCAM"
    wsPort?: number;
    status?: string;
  };
};

export default function SmartCCTV({ camera }: SmartCCTVProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const videoRef = useRef<HTMLVideoElement>(null); 
  
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState(false); // State untuk border merah

  // --- LOGIC SUARA ---
  const lastSpeakTime = useRef<number>(0);
  const SPEAK_COOLDOWN = 10000; 

  // 1. SETUP PLAYER
  useEffect(() => {
    let player: any;
    setLoading(true);
    setError(null);

    console.log(`🎥 Initializing Camera: ${camera.name} | Type: ${camera.type}`);

    // --- KASUS A: WEBCAM ---
    if (camera.type === "WEBCAM") {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("Webcam Error:", err);
            setError("Izin kamera ditolak");
            setLoading(false);
          });
      } else {
        setError("Browser tidak support webcam");
        setLoading(false);
      }
    } 
    
    // --- KASUS B: RTSP (JSMpeg) ---
    else if (camera.type === "RTSP") {
      if (!camera.wsPort) {
        setError("Port Stream tidak tersedia");
        setLoading(false);
        return;
      }

      const url = `ws://localhost:${camera.wsPort}`;
      console.log(`Connecting JSMpeg to ${url}...`);

      if (canvasRef.current) {
        try {
          player = new JSMpeg.Player(url, {
            canvas: canvasRef.current,
            audio: false,
            // PENTING: Matikan WebGL biar bisa di-snapshot
            disableGl: true, 
            videoBufferSize: 1024 * 1024, 
            onPlay: () => {
                setLoading(false);
                setError(null);
            }
          } as any);
        } catch (e) {
          console.error("JSMpeg Init Error:", e);
          setError("Gagal memuat player");
        }
      }
      
      const timeout = setTimeout(() => {
          if(loading) {
              if (!player || !player.source || !player.source.established) {
                  setError("Stream Offline / Koneksi Gagal");
                  setLoading(false);
              }
          }
      }, 5000);

      return () => {
        clearTimeout(timeout);
        if (player) {
            try { player.destroy(); } catch {}
        }
      };
    }
  }, [camera]);

  // 2. LOOP SNAPSHOT & SCAN
  useEffect(() => {
    const scanInterval = setInterval(async () => {
      if (error || loading) return;

      let imageBase64 = null;

      // Ambil gambar dari Webcam
      if (camera.type === "WEBCAM" && videoRef.current) {
        const v = videoRef.current;
        if (v.readyState === 4) {
            const c = document.createElement("canvas");
            c.width = v.videoWidth;
            c.height = v.videoHeight;
            c.getContext("2d")?.drawImage(v, 0, 0);
            imageBase64 = c.toDataURL("image/jpeg", 0.5);
        }
      } 
      // Ambil gambar dari RTSP (JSMpeg)
      else if (camera.type === "RTSP" && canvasRef.current) {
        try {
            imageBase64 = canvasRef.current.toDataURL("image/jpeg", 0.5);
        } catch (e) {
            console.warn("Gagal snapshot canvas RTSP");
        }
      }

      // KIRIM KE API
      if (imageBase64) {
        try {
          const res = await fetch("http://localhost:5005/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageBase64, cameraId: camera.id }),
          });
          const data = await res.json();
          
          if (data.success) {
            setDetections(data.detections);

            // --- ALERT LOGIC ---
            // Backend mengirim field 'shouldAlert' (true/false)
            if (data.shouldAlert) {
                setIsAlerting(true); // Nyalakan border merah

                // --- VOICE ALERT ---
                const violations = data.detections.filter((d: any) => !d.is_compliant);
                const now = Date.now();
                if (now - lastSpeakTime.current > SPEAK_COOLDOWN) {
                    const allMissing = violations.flatMap((v: any) => v.missing);
                    const uniqueMissing = [...new Set(allMissing)]; 
                    const missingText = uniqueMissing.join(" dan ");

                    if (missingText) {
                        const text = `Peringatan! Mohon gunakan ${missingText} dengan benar.`;
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = "id-ID"; 
                        utterance.rate = 1.0; 
                        utterance.volume = 1.0;
                        window.speechSynthesis.speak(utterance);
                        lastSpeakTime.current = now;
                    }
                }
            } else {
                setIsAlerting(false); // Matikan border merah
            }
          }
        } catch (e) { console.error("Scan API Error:", e); }
      }
    }, 1000); 

    return () => clearInterval(scanInterval);
  }, [camera, error, loading]);

  // Helper Scaling
  const getScale = () => {
     if (camera.type === "RTSP" && canvasRef.current) {
         const videoWidth = canvasRef.current.width;
         const videoHeight = canvasRef.current.height;
         const displayWidth = canvasRef.current.clientWidth;
         const displayHeight = canvasRef.current.clientHeight;
         return { x: displayWidth / videoWidth, y: displayHeight / videoHeight };
     }
     if (camera.type === "WEBCAM" && videoRef.current) {
         // Webcam di <video> object-contain biasanya scaling otomatis
         // Tapi karena kita gambar box absolute, kita perlu tau resolusi asli vs tampil
         const videoWidth = videoRef.current.videoWidth;
         const videoHeight = videoRef.current.videoHeight;
         const displayWidth = videoRef.current.clientWidth;
         const displayHeight = videoRef.current.clientHeight;
         
         // Hitung aspect ratio fit (contain)
         const videoRatio = videoWidth / videoHeight;
         const displayRatio = displayWidth / displayHeight;
         
         let finalWidth, finalHeight;
         if (displayRatio > videoRatio) {
             finalHeight = displayHeight;
             finalWidth = finalHeight * videoRatio;
         } else {
             finalWidth = displayWidth;
             finalHeight = finalWidth / videoRatio;
         }
         
         // Offset karena object-contain di tengah (center)
         const offsetX = (displayWidth - finalWidth) / 2;
         const offsetY = (displayHeight - finalHeight) / 2;

         return { 
             x: finalWidth / videoWidth, 
             y: finalHeight / videoHeight,
             offsetX, 
             offsetY
         };
     }
     return { x: 1, y: 1, offsetX: 0, offsetY: 0 };
  }

  // --- RENDER ---
  return (
    <div 
        ref={containerRef} 
        className={`relative w-full aspect-video bg-black overflow-hidden rounded-lg group transition-all duration-300 ${
            isAlerting ? "border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.7)]" : "border border-gray-800"
        }`}
    >
      
      {/* LAYER VIDEO */}
      {camera.type === "WEBCAM" ? (
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-contain transform scale-x-[-1] ${loading || error ? 'hidden' : 'block'}`} 
        />
      ) : (
        <canvas 
            ref={canvasRef} 
            className={`w-full h-full object-contain ${loading || error ? 'hidden' : 'block'}`} 
        />
      )}

      {/* LAYER ERROR */}
      {(loading || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-900/90 z-20">
            {loading && !error ? (
                <>
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-2" />
                    <p>Menghubungkan ke kamera...</p>
                </>
            ) : (
                <>
                    <VideoOff className="w-10 h-10 text-red-500 mb-2" />
                    <p className="text-red-400 font-bold">{error}</p>
                </>
            )}
        </div>
      )}

      {/* LAYER DETEKSI */}
      {!loading && !error && detections.map((d, idx) => {
        const [x1, y1, x2, y2] = d.box;
        
        // HITUNG SCALING + OFFSET
        const scale = getScale();
        
        const sx1 = (x1 * scale.x) + (scale.offsetX || 0);
        const sy1 = (y1 * scale.y) + (scale.offsetY || 0);
        const width = (x2 - x1) * scale.x;
        const height = (y2 - y1) * scale.y;

        return (
            <div
                key={idx}
                style={{
                    position: "absolute",
                    left: sx1, 
                    top: sy1, 
                    width: width, 
                    height: height,
                    border: d.is_compliant ? "3px solid #4ade80" : "3px solid #ef4444",
                    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                    zIndex: 10,
                    pointerEvents: "none"
                }}
            >
                {!d.is_compliant && (
                    <div className="absolute -top-8 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        MISSING: {d.missing.join(", ")}
                    </div>
                )}
            </div>
        )
      })}
    </div>
  );
}