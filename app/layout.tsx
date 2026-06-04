import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NODO Tecnologico",
  description: "Plataforma web para control, visualizacion y metricas del Edificio NODO TECNOLOGICO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
