import { useEffect, useState } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Box, CircularProgress 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import api from '../services/api'; // Importamos nuestra conexión


// Definimos cómo se ve un Chofer (para que TypeScript no se queje)
interface Driver {
  id: string; 
  name: string;
  email: string;
  vehicle: string;
  phone?: string;
}

export default function DriversList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar los datos cuando la pantalla se abre
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error("Error cargando choferes:", error);
      alert("Error al conectar con el servidor 😢");
    } finally {
      setLoading(false);
    }
  };

  // 2. Función para borrar un chofer
  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar a este chofer?')) return;
    
    try {
      await api.delete(`/drivers/${id}`);
      // Actualizamos la lista localmente (filtro el que borré)
      setDrivers(drivers.filter(driver => driver.id !== id));
    } catch (error) {
      alert("No se pudo eliminar ❌");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        🚚 Flota de Repartidores
      </Typography>

      {drivers.length === 0 ? (
        <Typography variant="h6" color="text.secondary">No hay choferes registrados aún.</Typography>
      ) : (
        <Grid container spacing={3}>
          {drivers.map((driver) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={driver.id}>
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{driver.name}</Typography>
                  </Box>
                  
                  <Typography color="text.secondary" gutterBottom>
                    📧 {driver.email}
                  </Typography>
                  
                  <Chip 
                    icon={<LocalShippingIcon />} 
                    label={driver.vehicle} 
                    color={driver.vehicle === 'Moto' ? 'warning' : 'success'} 
                    variant="outlined" 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(driver.id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}