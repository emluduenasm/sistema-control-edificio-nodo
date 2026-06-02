import type { Computadora } from "@/types/devices";

export const computadorasMock: Computadora[] = [
  {
    id: "pc-lab-01",
    nombre: "PC Laboratorio 01",
    ala: "este",
    planta: "entre-piso",
    zonaId: "este-ep-lab",
    ip: "10.10.20.11",
    conectada: true,
    ultimoPingMs: 12,
  },
  {
    id: "pc-aulas-03",
    nombre: "PC Aulas 03",
    ala: "este",
    planta: "planta-baja",
    zonaId: "este-pb-aulas",
    ip: "10.10.10.43",
    conectada: false,
    ultimoPingMs: 0,
  },
  {
    id: "pc-admin-02",
    nombre: "PC Administracion 02",
    ala: "oeste",
    planta: "planta-alta",
    zonaId: "oeste-pa-oficinas",
    ip: "10.10.30.22",
    conectada: true,
    ultimoPingMs: 18,
  },
];
