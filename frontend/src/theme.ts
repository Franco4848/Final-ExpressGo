import { createTheme } from "@mui/material/styles";


export function buildTheme(mode: "light" | "dark"){
    return createTheme({
        palette:{
            mode,
            ...(mode === "dark"
                ? {
                    background:{
                        default: "#0f172a",
                        paper: "#1e293b",
                    },
                    primary:{ main: "#3b82f6"},
                    secondary: { main: "#22c55e"},
                }
                :{
                    background:{
                        default: "#f6f7fb",
                        paper: "#ffffff",
                    },
                    primary:{ main: "#2563eb"},
                    secondary: {main: "#0f766e"},
                }),
        },
        shape: {borderRadius: 12},
        typography:{
            button:{ textTransform: "none", fontWeight: 600 },
        },
    });
}



// export const theme = createTheme({
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#2563eb", // azul prolijo
//     },
//     secondary: {
//       main: "#0f766e", // teal
//     },
//     background: {
//       default: "#f6f7fb", // fondo suave
//       paper: "#ffffff",
//     },
//   },
//   typography: {
//     fontFamily: [
//       "Inter",
//       "system-ui",
//       "-apple-system",
//       "Segoe UI",
//       "Roboto",
//       "Arial",
//       "sans-serif",
//     ].join(","),
//     h2: { fontWeight: 800 },
//     h3: { fontWeight: 700 },
//     button: { textTransform: "none", fontWeight: 600 },
//   },
//   shape: {
//     borderRadius: 12,
//   },
//   components: {
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 14,
//         },
//       },
//     },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 14,
//         },
//       },
//     },
//     MuiButton: {
//       defaultProps: {
//         variant: "contained",
//       },
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//           paddingLeft: 14,
//           paddingRight: 14,
//         },
//       },
//     },
//     MuiTextField: {
//       defaultProps: {
//         size: "small",
//       },
//     },
//     MuiSelect: {
//       defaultProps: {
//         size: "small",
//       },
//     },
//   },
// });
