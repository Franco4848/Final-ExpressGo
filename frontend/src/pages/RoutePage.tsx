import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { getDrivers } from "../services/drivers.service";
import { updatePackage } from "../services/packages.service";
import { getDriverRoute } from "../services/routes.service";
import type { Driver } from "../types/driver";
import type { Package, PackageStatus } from "../types/package";

import {DndContext, closestCenter,} from "@dnd-kit/core";
import type {DragEndEvent} from "@dnd-kit/core";
import {SortableContext,verticalListSortingStrategy,useSortable,arrayMove,} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {reorderDriverRoute} from "../services/routes.service"
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";



function markerColor(status: PackageStatus) {
  if (status === "ENTREGADO") return "✅";
  if (status === "EN_CAMINO") return "🚚";
  return "📦";
}

function SortableStopItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "white",
    opacity: isDragging ? 0.7 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}


export default function RoutePage() {
  


  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // ✅ NUEVO: stops y geometry vienen del backend
  const [stops, setStops] = useState<Package[]>([]);
  const [geometry, setGeometry] = useState<[number, number][]>([]);
  async function onDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;
  if (active.id === over.id) return;

  const oldIndex = stops.findIndex((s) => s.id === active.id);
  const newIndex = stops.findIndex((s) => s.id === over.id);

  if (oldIndex === -1 || newIndex === -1) return;

  const newStops = arrayMove(stops, oldIndex, newIndex);
  setStops(newStops);

  try {
    const orderedIds = newStops.map((s) => s.id);
    const res = await reorderDriverRoute(selectedDriverId, orderedIds);

    setStops(res.data.stops);
    setGeometry(res.data.route.geometry);
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el nuevo orden");
  }
}


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
        <FormControl size="small" sx={{minWidth:220}}>
          <InputLabel id="driver-label">Driver</InputLabel>

            <Select
            labelId="driver-label" 
            value={selectedDriverId}
            label="Seleccionar"
            onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              <MenuItem value="">
                <em>Seleccionar...</em>
              </MenuItem>

              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
        </FormControl>

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
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
  <SortableContext
    items={stops.map((s) => s.id)}
    strategy={verticalListSortingStrategy}
  >
    <div style={{ display: "grid", gap: 10 }}>
      {stops.map((p) => (
        <SortableStopItem key={p.id} id={p.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              {markerColor(p.status ?? "PENDIENTE")} <b>{p.trackingId}</b> — {p.recipientName}
              <div style={{ fontSize: 12, opacity: 0.8 }}>{p.address}</div>
              <div style={{ fontSize: 12 }}>
                Estado: {p.status ?? "PENDIENTE"} | Orden: {p.deliveryOrder ?? "—"}
              </div>
            </div>

            {(p.status ?? "PENDIENTE") !== "ENTREGADO" && (
              <button onClick={() => markDelivered(p)}>Entregado</button>
            )}
          </div>
        </SortableStopItem>
      ))}
    </div>
  </SortableContext>
</DndContext>

            )}
          </div>
        </div>
      )}
    </div>
  );
}
