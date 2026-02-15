import { useEffect, useState } from "react";
import DriverForm from "../components/DriversForm";
import type { Driver, CreateDriverDto } from "../types/driver";
import { getDrivers, createDriver, deleteDriver, updateDriver } from "../services/drivers.service";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";



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
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Drivers
      </Typography>

     

      <Paper>
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
      </Paper>

      <Divider style={{ margin: "20px 0" }} />

      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Vehículo</b></TableCell>
                <TableCell><b>Teléfono</b></TableCell>
                <TableCell align="right"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={d.vehicle}
                      size="small"
                      variant="outlined"
                      color={d.vehicle === "Moto" ? "warning" : "success"}
                    />
                  </TableCell>
                  <TableCell>{d.phone ?? "—"}</TableCell>

                  <TableCell align="right">
                    <IconButton
                      onClick={() => setEditingDriver(d)}
                      disabled={deletingId === d.id}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, opacity: 0.7 }}>
                    No hay drivers registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </TableContainer>

    </Box>
  );
}