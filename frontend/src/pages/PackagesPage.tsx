import { useEffect, useMemo, useState } from "react";
import PackageForm from "../components/PackageForm";
import type { Driver } from "../types/driver";
import type { Package, CreatePackageDto, PackageStatus } from "../types/package";
import { getDrivers } from "../services/drivers.service";
import { getPackages, createPackage, updatePackage, deletePackage } from "../services/packages.service";

export default function PackagesPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // filtros simples (requisito: filtros + búsqueda)
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

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const matchesQ =
        !q ||
        p.trackingId.toLowerCase().includes(q.toLowerCase()) ||
        p.address.toLowerCase().includes(q.toLowerCase()) ||
        p.recipientName.toLowerCase().includes(q.toLowerCase());

      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesDriver = !driverFilter || p.driverId === driverFilter;

      return matchesQ && matchesStatus && matchesDriver;
    });
  }, [packages, q, statusFilter, driverFilter]);

  return (
    <div>
      <h2>Packages</h2>

      <h3 style={{ marginTop: 10 }}>
        {editingPkg ? `Editando: ${editingPkg.trackingId}` : "Crear package"}
      </h3>

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

      <hr style={{ margin: "20px 0" }} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          placeholder="Buscar por tracking/dirección/destinatario"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 280 }}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_CAMINO">EN_CAMINO</option>
          <option value="ENTREGADO">ENTREGADO</option>
        </select>

        <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
          <option value="">Todos los drivers</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Dirección</th>
              <th>Destinatario</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th>Lat/Lng</th>
              <th>Driver</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.trackingId}</td>
                <td>{p.address}</td>
                <td>{p.recipientName}</td>
                <td>{p.size}</td>
                <td>{p.status}</td>
                <td>{p.lat}, {p.lng}</td>
                <td>
                  {drivers.find((d) => d.id === p.driverId)?.name || "—"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditingPkg(p)} disabled={deletingId === p.id}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                      {deletingId === p.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
