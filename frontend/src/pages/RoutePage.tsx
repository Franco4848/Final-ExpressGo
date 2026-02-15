import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { getDrivers } from "../services/drivers.service";
import { updatePackage } from "../services/packages.service";
import { getDriverRoute } from "../services/routes.service";
import type { Driver } from "../types/driver";
import type { Package, PackageStatus } from "../types/package";

function markerColor(status: PackageStatus) {
  if (status === "ENTREGADO") return "✅";
  if (status === "EN_CAMINO") return "🚚";
  return "📦";
}

export default function RoutePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // ✅ NUEVO: stops y geometry vienen del backend
  const [stops, setStops] = useState<Package[]>([]);
  const [geometry, setGeometry] = useState<[number, number][]>([]);

  // 1) cargar drivers al inicio
  useEffect(() => {
    async function loadDrivers() {
      setLoading(true);
      try {
        const dRes = await getDrivers();
        setDrivers(dRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadDrivers();
  }, []);

  // 2) cargar ruta cada vez que cambia el driver seleccionado
  useEffect(() => {
    async function loadRoute() {
      if (!selectedDriverId) {
        setStops([]);
        setGeometry([]);
        return;
      }

      setLoading(true);
      try {
        const res = await getDriverRoute(selectedDriverId);
        setStops(res.data.stops);

        // geometry viene en [lat,lng] desde tu backend (lo hicimos así)
        setGeometry(res.data.route.geometry);
      } catch (err) {
        console.error(err);
        alert("Error cargando ruta del driver");
        setStops([]);
        setGeometry([]);
      } finally {
        setLoading(false);
      }
    }

    loadRoute();
  }, [selectedDriverId]);

  const mapCenter = useMemo<[number, number]>(() => {
    // fallback si no hay stops
    if (stops.length === 0) return [-32.8895, -68.8458];
    return [stops[0].lat, stops[0].lng];
  }, [stops]);

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

      // actualiza UI
      setStops((prev) =>
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

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>Driver:</label>
        <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
          <option value="">Seleccionar...</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <span style={{ opacity: 0.8 }}>
          Paradas: {stops.length}
        </span>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          {/* MAPA */}
          <div style={{ height: 520, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* ✅ Polyline por calles (viene del backend) */}
              {geometry.length >= 2 && <Polyline positions={geometry} />}

              {stops.map((p, idx) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <div style={{ display: "grid", gap: 6 }}>
                      <b>Parada #{idx + 1}</b>
                      <div><b>Tracking:</b> {p.trackingId}</div>
                      <div><b>Destinatario:</b> {p.recipientName}</div>
                      <div><b>Dirección:</b> {p.address}</div>
                      <div><b>Estado:</b> {p.status ?? "PENDIENTE"}</div>

                      {(p.status ?? "PENDIENTE") !== "ENTREGADO" && (
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
            ) : stops.length === 0 ? (
              <p>Este driver no tiene paquetes asignados.</p>
            ) : (
              <ol style={{ display: "grid", gap: 10 }}>
                {stops.map((p) => (
                  <li key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        {markerColor(p.status ?? "PENDIENTE")} <b>{p.trackingId}</b> — {p.recipientName}
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{p.address}</div>
                        <div style={{ fontSize: 12 }}>Estado: {p.status ?? "PENDIENTE"}</div>
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
      )}
    </div>
  );
}
