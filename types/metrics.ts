import type { CapaActiva } from "@/types/building";

export type MetricPoint = {
  label: string;
  value: number;
};

export type MetricSummary = {
  capa: CapaActiva;
  titulo: string;
  valor: string;
  tendencia: "estable" | "sube" | "baja";
};
