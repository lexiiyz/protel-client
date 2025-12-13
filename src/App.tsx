import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import AbsensiPage from "./pages/AbsensiPage";
import MonitoringPage from "./pages/MonitoringPage";
import TambahPekerjaPage from "./pages/TambahPekerjaPage";
import JabatanManagerPage from "./pages/JabatanManagerPage";
import ListPekerjaPage from "./pages/ListPekerjaPage";
import LogsPage from "./logs/page";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage></DashboardPage>} />
        <Route path="/absensi" element={<AbsensiPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/pekerja/add" element={<TambahPekerjaPage />} />
        <Route path="/pekerja" element={<ListPekerjaPage />} />
        <Route path="/jabatan-manager" element={<JabatanManagerPage />} />
        <Route path="/logs" element={<LogsPage />}/>
      </Routes>
    </Router>
  );
}