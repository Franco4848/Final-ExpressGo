import { useEffect, useState } from "react";
import DriverForm from "../components/DriversForm";
import type { Driver, CreateDriverDto } from "../types/driver";
import { getDrivers, createDriver } from "../services/drivers.service";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  async function loadDrivers() {
    const res = await getDrivers();
    setDrivers(res.data);
  }

  async function handleCreate(data: CreateDriverDto) {
    await createDriver(data);
    await loadDrivers();
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  return (
    <div>
      <h2>Drivers</h2>

      <DriverForm onSubmit={handleCreate} />

      <hr />

      <ul>
        {drivers.map((d) => (
          <li key={d.id}>
            {d.name} - {d.email} - {d.vehicle}
          </li>
        ))}
      </ul>
    </div>
  );
}
