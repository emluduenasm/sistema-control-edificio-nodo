"use client";

import { useParams, useSearchParams } from "next/navigation";

import { LayerSelector } from "@/components/capas/layer-selector";
import { AireControls } from "@/components/controles/aire-controls";
import { InternetSummary } from "@/components/controles/internet-summary";
import { LucesControls } from "@/components/controles/luces-controls";
import { usePlantaUi } from "@/components/layout/planta-ui-context";
import { PlantaMasterControls } from "@/components/controles/planta-master-controls";
import { SectorControls } from "@/components/controles/sector-controls";
import { isCapaActiva } from "@/lib/svg/planta-map";
import type { CapaActiva } from "@/types/building";

export function BottomPanel() {
  const params = useParams<{ ala?: string; planta?: string }>();
  const searchParams = useSearchParams();
  const capaParam = searchParams.get("capa");
  const selectedId = searchParams.get("sector");
  const capaActiva: CapaActiva = isCapaActiva(capaParam) ? capaParam : "luces";
  const isPlantRoute = typeof params?.ala === "string" && typeof params?.planta === "string";
  const { lightAreaIds, lightStates, setCurrentPlantLightStates } = usePlantaUi();
  const visibleLightAreaIds = isPlantRoute ? lightAreaIds : [];
  const visibleLightStates = lightStates;

  const turnAllOn = () => {
    setCurrentPlantLightStates(
      Object.fromEntries(visibleLightAreaIds.map((id) => [id, true])) as Record<string, boolean>,
    );
  };

  const turnAllOff = () => {
    setCurrentPlantLightStates(
      Object.fromEntries(visibleLightAreaIds.map((id) => [id, false])) as Record<string, boolean>,
    );
  };

  const toggleLight = (ids: string[]) => {
    setCurrentPlantLightStates((current) => {
      const nextValue = !ids.every((id) => current[id] ?? true);

      return {
        ...current,
        ...Object.fromEntries(ids.map((id) => [id, nextValue])),
      };
    });
  };

  return (
    <footer className="border-t border-border/80 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="grid h-full min-h-0 grid-cols-[120px_280px_1fr] gap-5">
        <div className="flex justify-start">
          <LayerSelector />
        </div>
        <PlantaMasterControls
          capaActiva={capaActiva}
          selectedId={selectedId}
          onTurnAllOn={capaActiva === "luces" ? turnAllOn : undefined}
          onTurnAllOff={capaActiva === "luces" ? turnAllOff : undefined}
        />
        <div className="min-h-0">
          {isPlantRoute ? (
            <SectorControls
              capaActiva={capaActiva}
              selectedId={selectedId}
              lightAreaIds={visibleLightAreaIds}
              lightStates={visibleLightStates}
              onToggleLight={toggleLight}
            />
          ) : (
            <>
              {capaActiva === "luces" && <LucesControls />}
              {capaActiva === "aire" && <AireControls />}
              {capaActiva === "internet" && <InternetSummary />}
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
