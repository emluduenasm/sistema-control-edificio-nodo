import type { Ala, Planta, EstadoZona } from "@/types/building";

export type Dispositivo = {
  id: string;
  nombre: string;
  tipo: "luz" | "aire" | "bomba" | "router" | "switch";
  zonaId: string;
  estado: EstadoZona;
  encendido: boolean;
};

export type Computadora = {
  id: string;
  nombre: string;
  ala: Ala;
  planta: Planta;
  zonaId: string;
  ip: string;
  conectada: boolean;
  ultimoPingMs: number;
};
