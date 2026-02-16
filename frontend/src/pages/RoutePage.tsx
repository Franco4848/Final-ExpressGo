import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { getDrivers } from "../services/drivers.service";
import { updatePackage } from "../services/packages.service";
import { getDriverRoute, reorderDriverRoute } from "../services/routes.service";

import type { Driver } from "../types/driver";
import type { Package, PackageStatus } from "../types/package";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import Grid from "@mui/material/Grid";

function SortableStopItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        opacity: isDragging ? 0.7 : 1,
        cursor: "grab",
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </Paper>
  );
}

export default function RoutePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const [stops, setStops] = useState<Package[]>([]);
  const [geometry, setGeometry] = useState<[number, number][]>([]);

  useEffect(() => {
    async function loadDrivers() {
      const res = await getDrivers();
      setDrivers(res.data);
      setLoading(false);
    }
    loadDrivers();
  }, []);

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
        setGeometry(res.data.route.geometry);
      } finally {
        setLoading(false);
      }
    }

    loadRoute();
  }, [selectedDriverId]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (stops.length === 0) return [-32.8895, -68.8458];
    return [stops[0].lat, stops[0].lng];
  }, [stops]);

  async function markDelivered(pkg: Package) {
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

    setStops((prev) =>
      prev.map((p) =>
        p.id === pkg.id ? { ...p, status: "ENTREGADO" } : p
      )
    );
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);

    const newStops = arrayMove(stops, oldIndex, newIndex);
    setStops(newStops);

    const orderedIds = newStops.map((s) => s.id);
    const res = await reorderDriverRoute(selectedDriverId, orderedIds);

    setStops(res.data.stops);
    setGeometry(res.data.route.geometry);
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Ruta del driver
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="driver-label">Seleccionar</InputLabel>
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

          <Box sx={{ flexGrow: 1 }} />

          <Chip label={`Paradas: ${stops.length}`} variant="outlined" />

          <Chip
            label={`Entregadas: ${
              stops.filter((s) => s.status === "ENTREGADO").length
            }`}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ overflow: "hidden" }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Mapa
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ height: 520 }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {geometry.length >= 2 && (
                    <Polyline positions={geometry} />
                  )}

                  {stops.map((p) => (
                    <Marker key={p.id} position={[p.lat, p.lng]}>
                      <Popup>
                        <Stack spacing={1}>
                          <Typography fontWeight={700}>
                            {p.trackingId}
                          </Typography>

                          <Typography variant="body2">
                            {p.recipientName}
                          </Typography>

                          <Chip
                            size="small"
                            label={p.status ?? "PENDIENTE"}
                            color={
                              p.status === "ENTREGADO"
                                ? "success"
                                : "warning"
                            }
                          />

                          {p.status !== "ENTREGADO" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => markDelivered(p)}
                            >
                              Entregado
                            </Button>
                          )}
                        </Stack>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ height: 520, overflow: "auto", p: 2 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Paradas (ordenadas)
              </Typography>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={stops.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={1.5}>
                    {stops.map((p) => (
                      <SortableStopItem key={p.id} id={p.id}>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={600}>
                            {p.trackingId} — {p.recipientName}
                          </Typography>

                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {p.address}
                          </Typography>

                          <Chip
                            size="small"
                            label={p.status ?? "PENDIENTE"}
                            color={
                              p.status === "ENTREGADO"
                                ? "success"
                                : "warning"
                            }
                          />
                        </Stack>
                      </SortableStopItem>
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
