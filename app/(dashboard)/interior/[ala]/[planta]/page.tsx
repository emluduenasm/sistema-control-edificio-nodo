import { notFound } from "next/navigation";

import { PlantaViewer } from "@/components/planta/planta-viewer";
import { loadSvgMarkup } from "@/lib/svg/load-svg";
import { getPlantaSvgPath, isAla, isCapaActiva, isPlanta } from "@/lib/svg/planta-map";
import type { CapaActiva } from "@/types/building";

type PlantaPageProps = {
  params: Promise<{
    ala: string;
    planta: string;
  }>;
  searchParams?: Promise<{
    capa?: string | string[];
    sector?: string | string[];
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
  const selectedId =
    typeof resolvedSearchParams?.sector === "string" ? resolvedSearchParams.sector : null;
  const svgPath = getPlantaSvgPath(resolvedParams.ala, resolvedParams.planta);

  if (!svgPath) {
    notFound();
  }

  let svgMarkup: string;

  try {
    svgMarkup = await loadSvgMarkup(svgPath);
  } catch {
    notFound();
  }

  return (
    <PlantaViewer
      ala={resolvedParams.ala}
      planta={resolvedParams.planta}
      capaActiva={capaActiva}
      selectedId={selectedId}
      svgMarkup={svgMarkup}
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
