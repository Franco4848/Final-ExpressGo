import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { getDrivers } from "../services/drivers.service";
import { getPackages, updatePackage } from "../services/packages.service";
import type {Driver} from '../types/driver'
import type { Package, PackageStatus, PackageSize } from "../types/package";

function markerColor(status: PackageStatus) {
  // Por ahora solo cambiamos la “etiqueta” en lista; si querés iconos de colores después lo hacemos.
  if (status === "ENTREGADO") return "✅";
  if (status === "EN_CAMINO") return "🚚";
  return "📦";
}

export default function RoutePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  async function loadData() {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([getDrivers(), getPackages()]);
      setDrivers(dRes.data);
      setPackages(pRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const driverPackages = useMemo(() => {
    if (!selectedDriverId) return [];
    // si después agregás deliveryOrder, acá ordenás por eso.
    return packages
      .filter((p) => p.driverId === selectedDriverId)
      // orden simple: pendientes/en_camino primero, entregado al final
      .sort((a, b) => {
        const rank = (s: PackageStatus) =>
        s === "PENDIENTE" ? 0 : s === "EN_CAMINO" ? 1 : 2;

        const sa = a.status ?? "PENDIENTE";
        const sb = b.status ?? "PENDIENTE";

  return rank(sa) - rank(sb);
});

  }, [packages, selectedDriverId]);

  const polylinePositions = useMemo(() => {
    return driverPackages.map((p) => [p.lat, p.lng] as [number, number]);
  }, [driverPackages]);

  const mapCenter = useMemo<[number, number]>(() => {
    // Mendoza aprox como fallback
    if (driverPackages.length === 0) return [-32.8895, -68.8458];
    return [driverPackages[0].lat, driverPackages[0].lng];
  }, [driverPackages]);

  async function markDelivered(pkg: Package) {
    try {
      await updatePackage(pkg.id, {
        trackingId: pkg.trackingId,
        address: pkg.address,
        recipientName: pkg.recipientName,
        size: pkg.size,
        status: "ENTREGADO",
        lat: pkg.lat,
        lng: pkg.lng,
        driverId: pkg.driverId,
      });

      // actualizar local sin recargar todo
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, status: "ENTREGADO" } : p))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo marcar como ENTREGADO");
    }
  }

  return (
    <div>
      <h2>Ruta del driver</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <label>Driver:</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <span style={{ opacity: 0.8 }}>
              Paradas: {driverPackages.length}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            {/* MAPA */}
            <div style={{ height: 520, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {polylinePositions.length >= 2 && (
                  <Polyline positions={polylinePositions} />
                )}

                {driverPackages.map((p, idx) => (
                  <Marker key={p.id} position={[p.lat, p.lng]}>
                    <Popup>
                      <div style={{ display: "grid", gap: 6 }}>
                        <b>Parada #{idx + 1}</b>
                        <div><b>Tracking:</b> {p.trackingId}</div>
                        <div><b>Destinatario:</b> {p.recipientName}</div>
                        <div><b>Dirección:</b> {p.address}</div>
                        <div><b>Estado:</b> {p.status ?? "PENDIENTE"}</div>

                        {p.status !== "ENTREGADO" && (
                          <button onClick={() => markDelivered(p)}>
                            Marcar ENTREGADO
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* LISTA ORDENADA */}
            <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, height: 520, overflow: "auto" }}>
              <h3 style={{ marginTop: 0 }}>Paradas (ordenadas)</h3>

              {selectedDriverId === "" ? (
                <p>Elegí un driver para ver su ruta.</p>
              ) : driverPackages.length === 0 ? (
                <p>Este driver no tiene paquetes asignados.</p>
              ) : (
                <ol style={{ display: "grid", gap: 10 }}>
                  {driverPackages.map((p) => (
                    <li key={p.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          {markerColor(p.status ?? "PENDIENTE")} <b>{p.trackingId}</b> — {p.recipientName}
                          <div style={{ fontSize: 12, opacity: 0.8 }}>{p.address}</div>
                          <div style={{ fontSize: 12 }}>Estado: {p.status}</div>
                        </div>

                        {(p.status ?? "PENDIENTE") !== "ENTREGADO" && (
                          <button onClick={() => markDelivered(p)}>
                            Entregado
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
