"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { usePlantaUi } from "@/components/layout/planta-ui-context";
import { PlantaSvg } from "@/components/planta/planta-svg";
import { getPlantaSvgPath, isAla, isCapaActiva, isPlanta } from "@/lib/svg/planta-map";
import { getPlantKey } from "@/lib/svg/svg-events";
import {
  extractActiveAreaSvgIds,
  extractSvgIds,
  getIdsForLayer,
  getInteractiveSvgIds,
  sanitizeSvgMarkup,
} from "@/lib/svg/svg-interaction";
import { formatLabel } from "@/lib/utils/format";
import type { Ala, CapaActiva, Planta } from "@/types/building";

type PlantaViewerProps = {
  ala: Ala;
  planta: Planta;
  capaActiva: CapaActiva;
  selectedId: string | null;
  svgMarkup: string;
};

export function PlantaViewer({ ala, planta, capaActiva, selectedId, svgMarkup }: PlantaViewerProps) {
  const [interactiveIds, setInteractiveIds] = useState<string[]>([]);
  const [currentSvgMarkup, setCurrentSvgMarkup] = useState(svgMarkup);
  const params = useParams<{ ala?: string; planta?: string }>();
  const searchParams = useSearchParams();
  const { setCurrentInteractiveIds, setCurrentPlantLightAreas } = usePlantaUi();
  const currentAla: Ala = isAla(params?.ala ?? "") ? params.ala : ala;
  const currentPlanta: Planta = isPlanta(params?.planta ?? "") ? params.planta : planta;
  const plantKey = getPlantKey(currentAla, currentPlanta);
  const capaParam = searchParams.get("capa");
  const sectorParam = searchParams.get("sector");
  const currentCapaActiva: CapaActiva = isCapaActiva(capaParam) ? capaParam : capaActiva;
  const currentSelectedId = sectorParam ?? selectedId;
  const selectedExists = currentSelectedId ? interactiveIds.includes(currentSelectedId) : false;
  const currentSvgPath = getPlantaSvgPath(currentAla, currentPlanta);

  useEffect(() => {
    setCurrentSvgMarkup(svgMarkup);
  }, [svgMarkup]);

  useEffect(() => {
    let cancelled = false;

    async function syncSvgMarkup() {
      if (!currentSvgPath) {
        return;
      }

      const response = await fetch(currentSvgPath, { cache: "no-store" });
      const markup = sanitizeSvgMarkup(await response.text());

      if (!cancelled) {
        setCurrentSvgMarkup(markup);
      }
    }

    void syncSvgMarkup();

    return () => {
      cancelled = true;
    };
  }, [currentSvgPath]);

  const allInteractiveIds = useMemo(
    () => getInteractiveSvgIds(extractSvgIds(currentSvgMarkup)),
    [currentSvgMarkup],
  );
  const activeAreaIds = useMemo(() => extractActiveAreaSvgIds(currentSvgMarkup), [currentSvgMarkup]);
  const inferredLightAreaIds = useMemo(
    () => getIdsForLayer(allInteractiveIds, "luces"),
    [allInteractiveIds],
  );
  const lightAreaIds = useMemo(
    () => Array.from(new Set([...inferredLightAreaIds, ...activeAreaIds])),
    [activeAreaIds, inferredLightAreaIds],
  );

  useEffect(() => {
    setCurrentInteractiveIds(plantKey, allInteractiveIds);
    setCurrentPlantLightAreas(plantKey, lightAreaIds);
  }, [allInteractiveIds, lightAreaIds, plantKey, setCurrentInteractiveIds, setCurrentPlantLightAreas]);

  return (
    <section className="grid h-full grid-rows-[auto_1fr] gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">
            Ala {currentAla}
          </p>
          <h1 className="text-2xl font-semibold capitalize text-[#173863]">
            {formatLabel(currentPlanta)}
          </h1>
        </div>
        <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-[#6a87a2] shadow-pill">
          Capa activa: <span className="font-semibold capitalize">{currentCapaActiva}</span>
        </div>
      </div>

      <div className="relative min-h-0 overflow-hidden rounded-[24px] border border-border bg-white shadow-panel">
        <PlantaSvg
          key={`${currentAla}-${currentPlanta}-${currentCapaActiva}-${currentSelectedId ?? "none"}`}
          ala={currentAla}
          planta={currentPlanta}
          svgMarkup={currentSvgMarkup}
          capaActiva={currentCapaActiva}
          selectedId={selectedExists ? currentSelectedId : null}
          onIdsChange={setInteractiveIds}
        />

        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-border bg-white/90 px-3 py-2 text-xs text-[#718aa3] shadow-pill">
          Click en el plano para seleccionar un ID real del SVG.
        </div>
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-border bg-white/90 px-3 py-2 text-xs text-[#718aa3] shadow-pill">
          {interactiveIds.length} elementos activos en {currentCapaActiva}
        </div>
      </div>
    </section>
  );
}
