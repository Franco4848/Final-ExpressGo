import React, { useEffect, useState } from "react";
import type { CreatePackageDto, PackageSize, PackageStatus } from "../types/package";
import type { Driver } from "../types/driver";

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    // convertir a número en lat/lng
    if (name === "lat" || name === "lng") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    if (name === "driverId") {
      setFormData((prev) => ({ ...prev, driverId: value || undefined }));
      return;
    }

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
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <input
        name="trackingId"
        placeholder="trackingId"
        value={formData.trackingId}
        onChange={handleChange}
        required
      />

      <input
        name="address"
        placeholder="Dirección"
        value={formData.address}
        onChange={handleChange}
        required
      />

      <input
        name="recipientName"
        placeholder="Destinatario"
        value={formData.recipientName}
        onChange={handleChange}
        required
      />

      <div style={{ display: "flex", gap: 8 }}>
        <select
          name="size"
          value={formData.size}
          onChange={handleChange}
        >
          {(["Chico", "Mediano", "Grande"] as PackageSize[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          {(["PENDIENTE", "EN_CAMINO", "ENTREGADO"] as PackageStatus[]).map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          name="lat"
          placeholder="lat"
          value={String(formData.lat)}
          onChange={handleChange}
          required
        />
        <input
          name="lng"
          placeholder="lng"
          value={String(formData.lng)}
          onChange={handleChange}
          required
        />
      </div>

      <select name="driverId" value={formData.driverId ?? ""} onChange={handleChange}>
        <option value="">Sin asignar</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

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
