import React, { useEffect, useState } from "react";
import type { CreateDriverDto } from "../types/driver";
import { Paper, Stack, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface DriverFormProps {
  onSubmit: (data: CreateDriverDto) => Promise<void>;
  initialData?: CreateDriverDto;
  mode?: "create" | "edit";
  onCancelEdit?: () => void;
}

const emptyForm: CreateDriverDto = {
  name: "",
  email: "",
  vehicle: "Moto",
  phone: "",
};

export default function DriverForm({
  onSubmit,
  initialData,
  mode = "create",
  onCancelEdit,
}: DriverFormProps) {
  const [formData, setFormData] = useState<CreateDriverDto>(emptyForm);
  const [loading, setLoading] = useState(false);

  // cada vez que cambia initialData, actualizamos el form
  useEffect(() => {
    if (initialData) setFormData({ ...initialData, phone: initialData.phone ?? "" });
    else setFormData(emptyForm);
  }, [initialData]);

    function handleTextChange(
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    function handleSelectChange(e: SelectChangeEvent) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        phone: formData.phone?.trim() ? formData.phone : undefined,
      });

      if (mode === "create") {
        setFormData(emptyForm);
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      alert("Error guardando driver (mirá consola).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper sx={{ p:2 }}>
      <h2>Crear driver</h2>

    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 400 }}>

        <Stack spacing={2}>
          <TextField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            required
          />

          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleTextChange}
            required
          />
        <FormControl>
          <InputLabel id="vehicle-label">Vehículo</InputLabel>
          <Select
            labelId="vehicle-label"
            label="Vehículo" 
            name="vehicle" 
            value={formData.vehicle} 
            onChange={handleSelectChange}
          >

            <MenuItem value="Moto">Moto</MenuItem>
            <MenuItem value="Auto">Auto</MenuItem>
            <MenuItem value="Camioneta">Camioneta</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Phone"
          name="phone"
          value={formData.phone || ""}
          onChange={handleTextChange}
        />

          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit" variant="outlined" disabled={loading}>
              {loading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
            </Button>

            {mode === "edit" && (
              <Button type="button" onClick={onCancelEdit} disabled={loading}>
                Cancelar
              </Button>
            )}
          </div>
        </Stack>

    </form>
    </Paper>
  );
}
