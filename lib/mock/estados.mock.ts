import type { Dispositivo } from "@/types/devices";

export const dispositivosMock: Dispositivo[] = [
  {
    id: "luz-este-pb-lobby-01",
    nombre: "Circuito luces lobby",
    tipo: "luz",
    zonaId: "este-pb-lobby",
    estado: "normal",
    encendido: true,
  },
  {
    id: "aire-este-pb-aulas-01",
    nombre: "Aire aulas flexibles",
    tipo: "aire",
    zonaId: "este-pb-aulas",
    estado: "advertencia",
    encendido: true,
  },
  {
    id: "switch-este-ep-lab-01",
    nombre: "Switch laboratorio",
    tipo: "switch",
    zonaId: "este-ep-lab",
    estado: "normal",
    encendido: true,
  },
  {
    id: "bomba-oeste-ss-01",
    nombre: "Bomba sala de servicios",
    tipo: "bomba",
    zonaId: "oeste-ss-servicios",
    estado: "critico",
    encendido: true,
  },
];
