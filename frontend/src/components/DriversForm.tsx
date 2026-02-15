import React, { useEffect, useState } from "react";
import type { CreateDriverDto } from "../types/driver";

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <select name="vehicle" value={formData.vehicle} onChange={handleChange}>
        <option value="Moto">Moto</option>
        <option value="Auto">Auto</option>
        <option value="camioneta">camioneta</option>
      </select>

      <input
        type="text"
        name="phone"
        placeholder="Teléfono (opcional)"
        value={formData.phone || ""}
        onChange={handleChange}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
        </button>

        {mode === "edit" && (
          <button type="button" onClick={onCancelEdit} disabled={loading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
