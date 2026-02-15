import { useEffect, useState } from "react";
import DriverForm from "../components/DriversForm";
import type { Driver, CreateDriverDto } from "../types/driver";
import { getDrivers, createDriver, deleteDriver, updateDriver } from "../services/drivers.service";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  //Driver seleccionado para editar
  const [editingDriver, setEditingDriver] = useState<Driver |null>(null);

  async function loadDrivers() {
    const res = await getDrivers();
    setDrivers(res.data);
  }

  async function handleCreate(data: CreateDriverDto) {
    await createDriver(data);
    await loadDrivers();
  }

  async function handleUpdate(data: CreateDriverDto){
    if (!editingDriver) return;
    await updateDriver(editingDriver.id, data);
    setEditingDriver(null);
    await loadDrivers();
  }

  async function handleDelete(id: string){
    const ok = confirm("Seguro de que queres eleiminar este driver?")
    if(!ok) return;
    try{
        setDeletingId(id);
        await deleteDriver(id);
        await loadDrivers();
        if(editingDriver?.id === id) setEditingDriver(null);
    }catch(err: any){
        console.error(err);
        alert(
            err?.response?.data?.message
            ? JSON.stringify(err.response.data.message)
            : "Error eliminando driver"
        );
    }finally{
        setDeletingId(null);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  return (
    <div>
      <h2>Drivers</h2>

      <h3 style={{ marginTop: 10 }}>
        {editingDriver ? `Editando: ${editingDriver.name}` : "Crear driver"}
      </h3>

      <DriverForm
        mode={editingDriver ? "edit" : "create"}
        initialData={
          editingDriver
            ? {
                name: editingDriver.name,
                email: editingDriver.email,
                vehicle: editingDriver.vehicle,
                phone: editingDriver.phone,
              }
            : undefined
        }
        onSubmit={editingDriver ? handleUpdate : handleCreate}
        onCancelEdit={() => setEditingDriver(null)}
      />

      <hr style={{ margin: "20px 0" }} />

      <ul style={{ display: "grid", gap: 10, paddingLeft: 16 }}>
        {drivers.map((d) => (
          <li key={d.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <b>{d.name}</b> — {d.email} — {d.vehicle}
              {d.phone ? ` — ${d.phone}` : ""}
            </div>

            <button onClick={() => setEditingDriver(d)} disabled={deletingId === d.id}>
              Editar
            </button>

            <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id}>
              {deletingId === d.id ? "Eliminando..." : "Eliminar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}