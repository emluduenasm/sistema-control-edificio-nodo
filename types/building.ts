export type Ala = "este" | "oeste";

export type Planta = "planta-baja" | "entre-piso" | "planta-alta" | "sub-suelo";

export type CapaActiva = "luces" | "aire" | "internet";

export type EstadoZona = "normal" | "advertencia" | "critico" | "apagado";

export type Zona = {
  id: string;
  nombre: string;
  ala: Ala;
  planta: Planta;
  svgSelector: string;
  estado: EstadoZona;
  temperaturaC?: number;
  ocupacion?: number;
};
