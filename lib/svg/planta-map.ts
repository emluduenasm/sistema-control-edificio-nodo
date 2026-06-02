import type { Ala, CapaActiva, Planta } from "@/types/building";

export const alas: Ala[] = ["este", "oeste"];

export const plantas: Planta[] = ["planta-baja", "entre-piso", "planta-alta", "sub-suelo"];

export const capasActivas: CapaActiva[] = ["luces", "aire", "internet"];

export const plantaSvgMap: Record<Ala, Record<Planta, string>> = {
  este: {
    "planta-baja": "/planos/ala-este-planta-baja.svg",
    "entre-piso": "/planos/ala-este-entre-piso.svg",
    "planta-alta": "/planos/ala-este-planta-alta.svg",
    "sub-suelo": "/planos/ala-este-sub-suelo.svg",
  },
  oeste: {
    "planta-baja": "/planos/ala-oeste-planta-baja.svg",
    "entre-piso": "/planos/ala-oeste-entre-piso.svg",
    "planta-alta": "/planos/ala-oeste-planta-alta.svg",
    "sub-suelo": "/planos/ala-oeste-sub-suelo.svg",
  },
};

export const plantasDisponibles = alas.flatMap((ala) =>
  plantas.map((planta) => ({
    ala,
    planta,
    path: plantaSvgMap[ala][planta],
  })),
);

export function getPlantaSvgPath(ala: Ala, planta: Planta) {
  return plantaSvgMap[ala]?.[planta];
}

export function isAla(value: string): value is Ala {
  return alas.includes(value as Ala);
}

export function isPlanta(value: string): value is Planta {
  return plantas.includes(value as Planta);
}

export function isCapaActiva(value: unknown): value is CapaActiva {
  return typeof value === "string" && capasActivas.includes(value as CapaActiva);
}
