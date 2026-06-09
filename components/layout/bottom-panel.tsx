"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

import { LayerSelector } from "@/components/capas/layer-selector";
import { AireControls } from "@/components/controles/aire-controls";
import { InternetSummary } from "@/components/controles/internet-summary";
import { LucesControls, type LightControlGroup } from "@/components/controles/luces-controls";
import { usePlantaUi } from "@/components/layout/planta-ui-context";
import { PlantaMasterControls } from "@/components/controles/planta-master-controls";
import { SectorControls } from "@/components/controles/sector-controls";
import { isAla, isCapaActiva, plantas } from "@/lib/svg/planta-map";
import { formatLabel } from "@/lib/utils/format";
import type { Ala, CapaActiva } from "@/types/building";

export function BottomPanel() {
  const [isHydrated, setIsHydrated] = useState(false);
  const params = useParams<{ ala?: string; planta?: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const capaParam = searchParams.get("capa");
  const alaParam = searchParams.get("ala");
  const selectedId = searchParams.get("sector");
  const capaActiva: CapaActiva = isCapaActiva(capaParam) ? capaParam : "luces";
  const isPlantRoute = typeof params?.ala === "string" && typeof params?.planta === "string";
  const isInteriorOverview = pathname === "/interior";
  const overviewAla: Ala | null = isAla(alaParam) ? alaParam : null;
  const { lightAreaIds, lightAreaMap, lightStates, setCurrentPlantLightStates } = usePlantaUi();
  const overviewLightGroups = getOverviewLightGroups(lightAreaMap, overviewAla);
  const visibleOverviewLightGroups =
    isInteriorOverview && capaActiva === "luces" && !isHydrated ? [] : overviewLightGroups;
  const visibleLightAreaIds = isPlantRoute
    ? lightAreaIds
    : isInteriorOverview
      ? getVisibleOverviewLightIds(visibleOverviewLightGroups)
      : [];
  const visibleLightStates = lightStates;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  const toggleOverviewGroup = (ids: string[]) => {
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
      <div
        className={`grid h-full min-h-0 gap-5 ${
          capaActiva === "luces"
            ? "grid-cols-[120px_220px_1fr]"
            : capaActiva === "internet"
              ? "grid-cols-[120px_1fr]"
              : "grid-cols-[120px_280px_1fr]"
        }`}
      >
        <div className="flex justify-start">
          <LayerSelector />
        </div>
        {capaActiva !== "internet" ? (
          <PlantaMasterControls
            capaActiva={capaActiva}
            selectedId={selectedId}
            onTurnAllOn={capaActiva === "luces" ? turnAllOn : undefined}
            onTurnAllOff={capaActiva === "luces" ? turnAllOff : undefined}
          />
        ) : null}
        <div className="min-h-0">
          {isPlantRoute && capaActiva !== "internet" ? (
            <SectorControls
              capaActiva={capaActiva}
              selectedId={selectedId}
              lightAreaIds={visibleLightAreaIds}
              lightStates={visibleLightStates}
              onToggleLight={toggleLight}
            />
          ) : (
            <>
              {capaActiva === "luces" && (
                <LucesControls
                  groups={isInteriorOverview ? visibleOverviewLightGroups : []}
                  lightStates={visibleLightStates}
                  onToggleGroup={toggleOverviewGroup}
                />
              )}
              {capaActiva === "aire" && <AireControls />}
              {capaActiva === "internet" && <InternetSummary selectedId={selectedId} />}
            </>
          )}
        </div>
      </div>
    </footer>
  );
}

function getOverviewLightGroups(lightAreaMap: Record<string, string[]>, overviewAla: Ala | null) {
  const entries = Object.entries(lightAreaMap).filter(([, ids]) => ids.length > 0);

  if (entries.length === 0) {
    return [];
  }

  if (!overviewAla) {
    const wingGroups = (["este", "oeste"] as const)
      .map((ala) => {
        const ids = entries
          .filter(([plantKey]) => plantKey.startsWith(`${ala}:`))
          .flatMap(([, areaIds]) => areaIds);

        return ids.length > 0
          ? {
              ids,
              key: `ala:${ala}`,
              label: `Ala ${ala}`,
              detail: "",
            }
          : null;
      })
      .filter((group): group is LightControlGroup => group !== null);

    return wingGroups;
  }

  const plantGroups = plantas
    .map((planta) => {
      const ids = lightAreaMap[`${overviewAla}:${planta}`] ?? [];

      return ids.length > 0
        ? {
            ids,
            key: `${overviewAla}:${planta}`,
            label: formatLabel(planta),
            detail: "",
          }
        : null;
    })
    .filter((group): group is LightControlGroup => group !== null);

  return plantGroups;
}

function getVisibleOverviewLightIds(groups: LightControlGroup[]) {
  return Array.from(new Set(groups.flatMap((group) => group.ids)));
}
