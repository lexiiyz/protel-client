import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  // Fungsi helper untuk menentukan style jika link aktif vs tidak aktif
  const getLinkClass = (path : any) => {
    const baseClass = "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out";
    const activeClass = "bg-blue-600 text-white shadow-lg shadow-blue-500/30";
    const inactiveClass = "text-gray-300 hover:text-white hover:bg-white/10";

    return location.pathname === path 
      ? `${baseClass} ${activeClass}` 
      : `${baseClass} ${inactiveClass}`;
  };

  return (
    // Container utama dengan posisi fixed agar navbar selalu di atas saat scroll
    <nav className="fixed top-0 left-0 right-0 z-50 py-3 shadow-md">
      
      {/* Background dengan Gradient & Blur Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-md border-b border-white/10 shadow-xl"></div>

      {/* Konten Navbar */}
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo dengan Text Gradient */}
        <Link to="/" className="group">
          <h1 className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm group-hover:from-blue-300 group-hover:to-cyan-200 transition-all">
            SENTINELS
          </h1>
        </Link>

        {/* Menu Navigasi */}
        <div className="flex items-center gap-2">
          <Link to="/" className={getLinkClass("/")}>
            Dashboard
          </Link>
          
          <Link to="/absensi" className={getLinkClass("/absensi")}>
            Absensi
          </Link>
          
          <Link to="/monitoring" className={getLinkClass("/monitoring")}>
            Monitoring
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;