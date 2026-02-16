import { useMemo } from "react";
import type { ReactNode} from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import {
  AppBar,
  Box,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MapIcon from "@mui/icons-material/Map";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalPostOfficeIcon from "@mui/icons-material/LocalPostOffice";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const drawerWidth = 260;

const navItems = [
  { label: "Drivers", to: "/drivers", icon: <PeopleIcon /> },
  { label: "Packages", to: "/packages", icon: <LocalShippingIcon /> },
  { label: "Ruta", to: "/route", icon: <MapIcon /> },
  { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
];

function getSectionLabel(pathname: string) {
  const item = navItems.find((n) => pathname.startsWith(n.to));
  return item?.label ?? "ExpressGo";
}

export default function AppShell({
  children,
  mode,
  onToggleMode,
}: {
  children: ReactNode;
  mode: "light" | "dark";
  onToggleMode: () => void;
}) {
  // ✅ HOOKS ADENTRO DEL COMPONENTE
  const location = useLocation();
  const section = useMemo(
    () => getSectionLabel(location.pathname),
    [location.pathname]
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Top bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <LocalPostOfficeIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                ExpressGo
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Gestión de envíos y rutas
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={onToggleMode} title="Cambiar tema">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Chip label={section} color="primary" variant="outlined" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
            Menú
          </Typography>
        </Box>
        <Divider />

        <List sx={{ px: 1.5, py: 1 }}>
          {navItems.map((item) => {
            const selected = location.pathname.startsWith(item.to);

            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(37, 99, 235, 0.10)",
                    "&:hover": { bgcolor: "rgba(37, 99, 235, 0.14)" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selected ? 700 : 600,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            v1.0 • Final Programación 3
          </Typography>
        </Box>
      </Drawer>

      {/* Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
