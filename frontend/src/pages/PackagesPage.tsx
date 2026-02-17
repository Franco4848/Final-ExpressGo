import { useEffect, useMemo, useState } from "react";
import PackageForm from "../components/PackageForm";
import type { Driver } from "../types/driver";
import type { Package, CreatePackageDto, PackageStatus } from "../types/package";
import { getDrivers } from "../services/drivers.service";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../services/packages.service";

import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PackagesPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // filtros + búsqueda
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "">("");
  const [driverFilter, setDriverFilter] = useState<string>("");

  async function loadAll() {
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
    loadAll();
  }, []);

  async function handleCreate(data: CreatePackageDto) {
    await createPackage(data);
    await loadAll();
  }

  async function handleUpdate(data: CreatePackageDto) {
    if (!editingPkg) return;
    await updatePackage(editingPkg.id, data);
    setEditingPkg(null);
    await loadAll();
  }

  async function handleDelete(id: string) {
    const ok = confirm("¿Seguro que querés eliminar este package?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deletePackage(id);
      if (editingPkg?.id === id) setEditingPkg(null);
      await loadAll();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message
          ? JSON.stringify(err.response.data.message)
          : "Error eliminando package"
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ✅ Mapa driverId -> name para no hacer find() en cada fila
  const driverNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of drivers) map[d.id] = d.name;
    return map;
  }, [drivers]);

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const status = (p.status ?? "PENDIENTE") as PackageStatus;

      const text = `${p.trackingId} ${p.address} ${p.recipientName}`.toLowerCase();
      const matchesQ = !q || text.includes(q.toLowerCase());
      const matchesStatus = !statusFilter || status === statusFilter;
      const matchesDriver = !driverFilter || p.driverId === driverFilter;

      return matchesQ && matchesStatus && matchesDriver;
    });
  }, [packages, q, statusFilter, driverFilter]);

  function statusChipColor(status: PackageStatus) {
    if (status === "ENTREGADO") return "success";
    if (status === "EN_CAMINO") return "info";
    return "warning";
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Packages
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Gestión de encomiendas, filtros y edición
        </Typography>
      </Stack>

      {/* Form */}
      <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          {editingPkg ? `Editando: ${editingPkg.trackingId}` : "Crear package"}
        </Typography>

        <PackageForm
          drivers={drivers}
          mode={editingPkg ? "edit" : "create"}
          initialData={
            editingPkg
              ? {
                  trackingId: editingPkg.trackingId,
                  address: editingPkg.address,
                  recipientName: editingPkg.recipientName,
                  size: editingPkg.size,
                  status: editingPkg.status,
                  lat: editingPkg.lat,
                  lng: editingPkg.lng,
                  driverId: editingPkg.driverId,
                }
              : undefined
          }
          onSubmit={editingPkg ? handleUpdate : handleCreate}
          onCancelEdit={() => setEditingPkg(null)}
        />
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            placeholder="Buscar por tracking, dirección o destinatario..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Estado</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
              <MenuItem value="EN_CAMINO">EN_CAMINO</MenuItem>
              <MenuItem value="ENTREGADO">ENTREGADO</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="driver-filter-label">Driver</InputLabel>
            <Select
              labelId="driver-filter-label"
              label="Driver"
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip label={`Resultados: ${filtered.length}`} variant="outlined" />
        </Stack>
      </Paper>

      {/* Tabla */}
      <Paper sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Tracking</b></TableCell>
                  <TableCell><b>Dirección</b></TableCell>
                  <TableCell><b>Destinatario</b></TableCell>
                  <TableCell><b>Tamaño</b></TableCell>
                  <TableCell><b>Estado</b></TableCell>
                  <TableCell><b>Lat/Lng</b></TableCell>
                  <TableCell><b>Driver</b></TableCell>
                  <TableCell align="right"><b>Acciones</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((p) => {
                  const status = (p.status ?? "PENDIENTE") as PackageStatus;

                  return (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{p.trackingId}</TableCell>

                      <TableCell
                        sx={{
                          maxWidth: 320,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={p.address}
                      >
                        {p.address}
                      </TableCell>

                      <TableCell>{p.recipientName}</TableCell>
                      <TableCell>{p.size}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={status}
                          color={statusChipColor(status) as any}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)}
                      </TableCell>

                      <TableCell>{p.driverId ? driverNameById[p.driverId] ?? "—" : "—"}</TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={() => setEditingPkg(p)}
                          disabled={deletingId === p.id}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, opacity: 0.7 }}>
                      Sin resultados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
