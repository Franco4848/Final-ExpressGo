import { useState } from "react";
import type { CreateDriverDto } from "../types/driver";

interface DriverFormProps {
  onSubmit: (data: CreateDriverDto) => Promise<void>;
  initialData?: CreateDriverDto;
}

export default function DriverForm({
  onSubmit,
  initialData,
}: DriverFormProps) {
  const [formData, setFormData] = useState<CreateDriverDto>(
    initialData || {
      name: "",
      email: "",
      vehicle: "Moto",
      phone: "",
    }
  );

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      await onSubmit(formData);

      // limpiar form solo si no es edición
      if (!initialData) {
        setFormData({
          name: "",
          email: "",
          vehicle: "Moto",
          phone: "",
        });
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
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

      <select
        name="vehicle"
        value={formData.vehicle}
        onChange={handleChange}
      >
        <option value="Moto">Moto</option>
        <option value="Auto">Auto</option>
        <option value="camioneta">Camioneta</option>
      </select>

      <input
        type="text"
        name="phone"
        placeholder="Teléfono (opcional)"
        value={formData.phone || ""}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
