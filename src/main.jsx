import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { ImpactLayer } from "./ImpactLayer.jsx";
import "./styles.css";
import "./impact.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <App />
      <ImpactLayer />
    </>
  </React.StrictMode>,
);
