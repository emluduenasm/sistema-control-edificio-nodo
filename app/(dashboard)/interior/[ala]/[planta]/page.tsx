import { notFound } from "next/navigation";

import { PlantaViewer } from "@/components/planta/planta-viewer";
import { getPlantaSvgPath, isAla, isCapaActiva, isPlanta } from "@/lib/svg/planta-map";
import type { CapaActiva } from "@/types/building";

type PlantaPageProps = {
  params: Promise<{
    ala: string;
    planta: string;
  }>;
  searchParams?: Promise<{
    capa?: string | string[];
  }>;
};

export default async function PlantaPage({ params, searchParams }: PlantaPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (!isAla(resolvedParams.ala) || !isPlanta(resolvedParams.planta)) {
    notFound();
  }

  const capaParam = resolvedSearchParams?.capa;
  const capaActiva: CapaActiva = isCapaActiva(capaParam) ? capaParam : "luces";
  const svgPath = getPlantaSvgPath(resolvedParams.ala, resolvedParams.planta);

  if (!svgPath) {
    notFound();
  }

  return (
    <PlantaViewer
      ala={resolvedParams.ala}
      planta={resolvedParams.planta}
      capaActiva={capaActiva}
    />
  );
}

export function generateStaticParams() {
  return [
    { ala: "este", planta: "planta-baja" },
    { ala: "este", planta: "entre-piso" },
    { ala: "este", planta: "planta-alta" },
    { ala: "este", planta: "sub-suelo" },
    { ala: "oeste", planta: "planta-baja" },
    { ala: "oeste", planta: "entre-piso" },
    { ala: "oeste", planta: "planta-alta" },
    { ala: "oeste", planta: "sub-suelo" },
  ];
}

export const dynamicParams = false;
