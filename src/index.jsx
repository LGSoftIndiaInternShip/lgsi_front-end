import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ErrorPage from "./pages/ErrorPage";
import { createTheme, ThemeProvider } from "@mui/material";
import ServerSide from "./pages/ServerSide";

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
    path: "ServerSide",
    element: <ServerSide />,
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
