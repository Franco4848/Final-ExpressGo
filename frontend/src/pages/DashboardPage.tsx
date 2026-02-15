import { useEffect, useMemo, useState } from "react";
import { getDrivers } from "../services/drivers.service";
import { getPackages } from "../services/packages.service";
import type { Driver } from "../types/driver";
import type { Package } from "../types/package";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dRes, pRes] = await Promise.all([getDrivers(), getPackages()]);
        setDrivers(dRes.data);
        setPackages(pRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = packages.length;
    const delivered = packages.filter((p) => (p.status ?? "PENDIENTE") === "ENTREGADO").length;
    const pending = packages.filter((p) => (p.status ?? "PENDIENTE") !== "ENTREGADO").length;

    // Repartidor con más envíos (cuenta por driverId)
    const byDriver: Record<string, number> = {};
    for (const p of packages) {
      if (!p.driverId) continue;
      byDriver[p.driverId] = (byDriver[p.driverId] ?? 0) + 1;
    }

    let topDriverId: string | null = null;
    let topCount = 0;
    for (const [driverId, count] of Object.entries(byDriver)) {
      if (count > topCount) {
        topCount = count;
        topDriverId = driverId;
      }
    }

    const topDriverName =
      topDriverId ? drivers.find((d) => d.id === topDriverId)?.name ?? "Desconocido" : "—";

    return { total, delivered, pending, topDriverName, topCount };
  }, [packages, drivers]);

  const pieData = useMemo(
    () => [
      { name: "Entregadas", value: stats.delivered },
      { name: "Pendientes", value: stats.pending },
    ],
    [stats.delivered, stats.pending]
  );

  const barData = useMemo(() => {
    // Top 6 drivers por cantidad de envíos
    const counts = drivers.map((d) => {
      const count = packages.filter((p) => p.driverId === d.id).length;
      return { name: d.name, envios: count };
    });

    return counts.sort((a, b) => b.envios - a.envios).slice(0, 6);
  }, [drivers, packages]);

  if (loading) return <p>Cargando dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={kpiCard}>
          <div style={kpiLabel}>Total entregas</div>
          <div style={kpiValue}>{stats.total}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Completadas</div>
          <div style={kpiValue}>{stats.delivered}</div>
          <div style={kpiHint}>Pendientes: {stats.pending}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Repartidor con más envíos</div>
          <div style={kpiValue}>{stats.topDriverName}</div>
          <div style={kpiHint}>Envíos: {stats.topCount}</div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Completadas vs Pendientes</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Top drivers por envíos</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="envios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const kpiCard: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 12,
  background: "white",
};

const kpiLabel: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
};

const kpiValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginTop: 6,
};

const kpiHint: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.75,
  marginTop: 4,
};

const panel: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 12,
  background: "white",
};
