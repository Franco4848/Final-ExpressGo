import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";

import DriversPage from "./pages/DriversPage";
import PackagesPage from "./pages/PackagesPage";
import RoutePage from "./pages/RoutePage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/route" element={<RoutePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/" element={<Navigate to="/drivers" replace />} />
        <Route path="*" element={<p>Página no encontrada</p>} />
      </Routes>
    </AppShell>
  );
}
