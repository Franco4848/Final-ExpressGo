import { Link, Routes, Route, Navigate } from "react-router-dom";
import DriversPage from "./pages/DriversPage";
import PackagesPage from "./pages/PackagesPage";
import RoutePage from "./pages/RoutePage";
import DashboardPage from "./pages/DashboardPage";


export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Link to="/drivers">Drivers</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/route">Ruta</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/route" element={<RoutePage />} />

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/drivers" replace />} />

        {/* 404 simple */}
        <Route path="*" element={<p>Página no encontrada</p>} />
        <Route path="/dashboard" element={<DashboardPage />} />

      </Routes>
    </div>
  );
}
