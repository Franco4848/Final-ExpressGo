import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";
import { buildTheme } from "./theme";

import "leaflet/dist/leaflet.css";
import "./components/leafletFix";

function Root() {
  const [mode, setMode] = React.useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("themeMode");
    return saved === "dark" ? "dark" : "light";
  });

  const theme = React.useMemo(() => buildTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App mode={mode} onToggleMode={toggleMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
