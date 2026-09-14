import React, { useState, useEffect } from "react";
import { supabaseRest, supabaseSignIn } from "./supabaseClient";

/**
 * Casa Vellumine — Componente Raiz Modular (para projetos Vite / Next.js)
 */
export default function App() {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#F3F1EA", background: "#0A0F1E", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: "2.5rem", color: "#C9A24C" }}>
        Casa Vellumine
      </h1>
      <p style={{ color: "#A9B2C9", marginTop: 8 }}>
        Para abrir a aplicação completa com interface visual e painel administrativo, abra o arquivo <code>index.html</code> no seu navegador.
      </p>
    </div>
  );
}
