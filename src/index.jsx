import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ErrorPage from "./pages/ErrorPage";
import { createTheme, ThemeProvider } from "@mui/material";
import RoadCrack from "./pages/RoadCrack";

const root = createRoot(document.getElementById("root"));
const theme = createTheme({
  palette: {
    primary: {
      main: "#EBB900",
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "roadCrack",
    element: <RoadCrack />,
    errorElement: <ErrorPage />,
  },
]);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
