import React, { useEffect, useState } from "react";
import type { CreatePackageDto, PackageSize, PackageStatus } from "../types/package";
import type { Driver } from "../types/driver";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface PackageFormProps {
  onSubmit: (data: CreatePackageDto) => Promise<void>;
  initialData?: CreatePackageDto;
  mode?: "create" | "edit";
  onCancelEdit?: () => void;
  drivers: Driver[];
}

const emptyForm: CreatePackageDto = {
  trackingId: "",
  address: "",
  recipientName: "",
  size: "Chico",
  status: "PENDIENTE",
  lat: 0,
  lng: 0,
  driverId: undefined,
};

export default function PackageForm({
  onSubmit,
  initialData,
  mode = "create",
  onCancelEdit,
  drivers,
}: PackageFormProps) {
  const [formData, setFormData] = useState<CreatePackageDto>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(emptyForm);
  }, [initialData]);

  // ✅ Para TextField (input/textarea)
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    if (name === "lat" || name === "lng") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ✅ Para MUI Select
  function handleSelectChange(e: SelectChangeEvent) {
    const { name, value } = e.target;

    // driverId: si viene "", lo guardamos como undefined
    if (name === "driverId") {
      setFormData((prev) => ({ ...prev, driverId: value || undefined }));
      return;
    }

    // size/status son strings válidos en tu DTO
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      await onSubmit(formData);
      if (mode === "create") setFormData(emptyForm);
    } catch (err) {
      console.error(err);
      alert("Error guardando package (mirá consola).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
        <Stack spacing={2}>
          <TextField
            label="TrackingId"
            name="trackingId"
            value={formData.trackingId}
            onChange={handleChange}
            required
          />

          <TextField
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <TextField
            label="Destinatario"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            required
          />

          <div style={{ display: "flex", gap: 8 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="size-label">Size</InputLabel>
              <Select
                labelId="size-label"
                label="Size"
                name="size"
                value={formData.size}
                onChange={handleSelectChange}
              >
                {(["Chico", "Mediano", "Grande"] as PackageSize[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                label="Estado"
                name="status"
                value={formData.status ?? "PENDIENTE"}
                onChange={handleSelectChange}
              >
                {(["PENDIENTE", "EN_CAMINO", "ENTREGADO"] as PackageStatus[]).map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <TextField
              label="Lat"
              name="lat"
              value={String(formData.lat)}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Lng"
              name="lng"
              value={String(formData.lng)}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          {/* ✅ DriverId también en MUI */}
          <FormControl fullWidth size="small">
            <InputLabel id="driverId-label">Driver</InputLabel>
            <Select
              labelId="driverId-label"
              label="Driver"
              name="driverId"
              value={formData.driverId ?? ""}
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>Sin asignar</em>
              </MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
            </Button>

            {mode === "edit" && (
              <Button variant="outlined" type="button" onClick={onCancelEdit} disabled={loading}>
                Cancelar
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
