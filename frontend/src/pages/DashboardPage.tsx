import { useEffect, useMemo, useState } from "react";
import { getDrivers } from "../services/drivers.service";
import { getPackages } from "../services/packages.service";
import type { Driver } from "../types/driver";
import type { Package } from "../types/package";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";

export default function DashboardPage() {
  const theme = useTheme();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dRes, pRes] = await Promise.all([getDrivers(), getPackages()]);
        setDrivers(dRes.data);
        setPackages(pRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = packages.length;
    const delivered = packages.filter(
      (p) => (p.status ?? "PENDIENTE") === "ENTREGADO"
    ).length;
    const pending = total - delivered;

    const byDriver: Record<string, number> = {};
    for (const p of packages) {
      if (!p.driverId) continue;
      byDriver[p.driverId] = (byDriver[p.driverId] ?? 0) + 1;
    }

    let topDriverId: string | null = null;
    let topCount = 0;

    for (const [driverId, count] of Object.entries(byDriver)) {
      if (count > topCount) {
        topCount = count;
        topDriverId = driverId;
      }
    }

    const topDriverName =
      topDriverId
        ? drivers.find((d) => d.id === topDriverId)?.name ?? "Desconocido"
        : "—";

    return { total, delivered, pending, topDriverName, topCount };
  }, [packages, drivers]);

  const pieData = useMemo(
    () => [
      { name: "Entregadas", value: stats.delivered },
      { name: "Pendientes", value: stats.pending },
    ],
    [stats.delivered, stats.pending]
  );

  const barData = useMemo(() => {
    const counts = drivers.map((d) => {
      const count = packages.filter((p) => p.driverId === d.id).length;
      return { name: d.name, envios: count };
    });

    return counts.sort((a, b) => b.envios - a.envios).slice(0, 6);
  }, [drivers, packages]);

  const textColor = theme.palette.text.primary;
  const gridColor = theme.palette.divider;

  const barColor = theme.palette.primary.main;
  const pieColors = [theme.palette.success.main, theme.palette.warning.main];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Resumen de entregas y performance
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Total: ${stats.total}`} variant="outlined" />
          <Chip label={`Entregadas: ${stats.delivered}`} color="success" variant="outlined" />
          <Chip label={`Pendientes: ${stats.pending}`} color="warning" variant="outlined" />
        </Stack>
      </Stack>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={kpiPaper}>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>
              Total entregas
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              En el sistema
            </Typography>
          </Paper>
        </Grid>

        <Grid size= {{xs:12, md:4}}>
          <Paper sx={kpiPaper}>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>
              Completadas
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {stats.delivered}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Pendientes: {stats.pending}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{xs:12, md:4}}>
          <Paper sx={kpiPaper}>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>
              Repartidor con más envíos
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {stats.topDriverName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Envíos: {stats.topCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{xs:12, md:6}}>
          <Paper sx={panelPaper}>
            <Stack spacing={0.5} sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Completadas vs Pendientes
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Estado general de la operación
              </Typography>
            </Stack>

            <Divider />

            <Box sx={{ height: 320, p: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={105}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      color: textColor,
                    }}
                    labelStyle={{ color: textColor }}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{xs:12, md:6}}>
          <Paper sx={panelPaper}>
            <Stack spacing={0.5} sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Top drivers por envíos
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Ranking de carga de trabajo
              </Typography>
            </Stack>

            <Divider />

            <Box sx={{ height: 320, p: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                  <YAxis allowDecimals={false} stroke={textColor} tick={{ fill: textColor }} />
                  <Tooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      color: textColor,
                    }}
                    labelStyle={{ color: textColor }}
                  />
                  <Bar dataKey="envios" fill={barColor} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

const kpiPaper = {
  p: 2,
  borderRadius: 3,
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
} as const;

const panelPaper = {
  borderRadius: 3,
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  overflow: "hidden",
} as const;
