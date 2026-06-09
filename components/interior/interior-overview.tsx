"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { usePlantaUi } from "@/components/layout/planta-ui-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { NetworkSignalQuality } from "@/lib/network/network-status";
import { isAla, isCapaActiva } from "@/lib/svg/planta-map";
import { getPlantKey } from "@/lib/svg/svg-events";
import {
  applyLayerVisibilityToSvgMarkup,
  extractActiveAreaSvgIds,
  extractSvgIds,
  getIdsForLayer,
  getInteractiveSvgIds,
  isPcSvgElement,
} from "@/lib/svg/svg-interaction";
import { cn } from "@/lib/utils";
import { formatLabel } from "@/lib/utils/format";
import type { Ala, CapaActiva, Planta } from "@/types/building";

type InteriorOverviewProps = {
  overviewLightAreas: Array<{
    ala: Ala;
    areaIds: string[];
    planta: Planta;
    svgMarkup: string;
  }>;
};

const layerLabels: Record<CapaActiva, string> = {
  aire: "Aire",
  internet: "Internet",
  luces: "Luces",
};

const plantDisplayOrder: Planta[] = [
  "planta-alta",
  "entre-piso",
  "planta-baja",
  "sub-suelo",
];

const previewLayerStyles: Record<CapaActiva, { fill: string; stroke: string }> = {
  luces: { fill: "#f6db63", stroke: "#d7a100" },
  
  internet: { fill: "#8fd3ff", stroke: "#2b9ee8" },
  aire: { fill: "#94e0b8", stroke: "#27a36d" },
};

type OverviewPlant = InteriorOverviewProps["overviewLightAreas"][number];

export function InteriorOverview({ overviewLightAreas }: InteriorOverviewProps) {
  const searchParams = useSearchParams();
  const { lightStates, setCurrentPlantLightAreas } = usePlantaUi();
  const [liveInternetSignals, setLiveInternetSignals] = useState<Record<string, NetworkSignalQuality>>(
    {},
  );
  const capaParam = searchParams.get("capa");
  const alaParam = searchParams.get("ala");
  const currentCapa: CapaActiva = isCapaActiva(capaParam) ? capaParam : "luces";
  const currentAla: Ala | null = isAla(alaParam) ? alaParam : null;

  useEffect(() => {
    overviewLightAreas.forEach(({ ala, areaIds, planta }) => {
      setCurrentPlantLightAreas(getPlantKey(ala, planta), areaIds);
    });
  }, [overviewLightAreas, setCurrentPlantLightAreas]);

  useEffect(() => {
    if (currentCapa !== "internet") {
      return;
    }

    let isMounted = true;

    const syncNetworkStatus = async () => {
      try {
        const response = await fetch("/api/network-status/current", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { signals?: Record<string, NetworkSignalQuality> };

        if (isMounted && payload.signals) {
          setLiveInternetSignals(payload.signals);
        }
      } catch {
        // Keep the last known state if refresh fails.
      }
    };

    void syncNetworkStatus();
    const intervalId = window.setInterval(syncNetworkStatus, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [currentCapa]);

  const visiblePlants = currentAla ? getPlantsForAla(overviewLightAreas, currentAla) : [];
  const plantPreviewsByAla: Record<Ala, OverviewPlant[]> = {
    este: getPlantsForAla(overviewLightAreas, "este"),
    oeste: getPlantsForAla(overviewLightAreas, "oeste"),
  };

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">Interior</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#173863]">
              {currentAla ? `Ala ${currentAla}` : "Seleccion de ala"}
            </h1>
            {currentAla ? (
              <p className="mt-2 text-[#6b87a1]">
                Primero elegiste el ala. Ahora selecciona la planta que quieras abrir.
              </p>
            ) : null}
          </div>
          <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-[#6a87a2] shadow-pill">
            Capa activa: <span className="font-semibold">{layerLabels[currentCapa]}</span>
          </div>
        </div>
      </div>

      {!currentAla ? (
        <div className="grid gap-6 md:grid-cols-2">
          {(["este", "oeste"] as const).map((ala) => (
            <Link key={ala} href={buildInteriorHref(searchParams, ala)}>
              <Card className="h-full border-[#d9e8f4] bg-[#fbfeff] transition hover:border-[#8bd6ff] hover:shadow-pill">
                <CardHeader className="space-y-3 p-4">
                  <CardTitle className="text-2xl capitalize text-[#173863]">{`Ala ${ala}`}</CardTitle>
                  <AlaSvgPreview
                    plants={plantPreviewsByAla[ala]}
                    capaActiva={currentCapa}
                    internetSignals={liveInternetSignals}
                    lightStates={lightStates}
                  />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Link
              href={buildInteriorHref(searchParams, null)}
              className={cn(
                "inline-flex items-center rounded-full border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-[#5f89b4] shadow-pill transition",
                "hover:border-[#8bd6ff] hover:text-[#173863]",
              )}
            >
              Ver alas
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plantDisplayOrder
              .map((planta) => visiblePlants.find((item) => item.planta === planta))
              .filter(isOverviewPlant)
              .map(({ ala, planta, svgMarkup }) => (
                <Link key={`${ala}-${planta}`} href={`/interior/${ala}/${planta}?capa=${currentCapa}`}>
                  <Card className="h-full border-[#d9e8f4] bg-[#fbfeff] transition hover:border-[#8bd6ff] hover:shadow-pill">
                    <CardHeader className="space-y-3 p-4">
                      <CardTitle className="text-xl text-[#173863]">{formatLabel(planta)}</CardTitle>
                      <PlantSvgPreview
                        svgMarkup={svgMarkup}
                        capaActiva={currentCapa}
                        internetSignals={liveInternetSignals}
                        lightStates={lightStates}
                      />
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          </div>
        </>
      )}
    </section>
  );
}

function AlaSvgPreview({
  plants,
  capaActiva,
  internetSignals,
  lightStates,
  compact = true,
}: {
  plants: InteriorOverviewProps["overviewLightAreas"];
  capaActiva: CapaActiva;
  internetSignals: Record<string, NetworkSignalQuality>;
  lightStates: Record<string, boolean>;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] border border-[#d9e8f4] bg-white/90",
        compact ? "shadow-inner" : "shadow-panel",
      )}
    >
      <div className="grid gap-px bg-[#d9e8f4] lg:grid-cols-2">
        {plants.map(({ ala, planta, svgMarkup }) => (
          <div key={`${ala}-${planta}`} className="bg-[#f8fbfe] p-2">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d89a6]">
              {formatLabel(planta)}
            </p>
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-[#e2edf6] bg-white",
                compact ? "aspect-[16/9] max-h-32" : "aspect-[16/9] max-h-40",
              )}
            >
              <div
                className="h-full w-full p-1.5 [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-none [&_svg]:object-contain"
                dangerouslySetInnerHTML={{
                  __html: getPreviewSvgMarkup(svgMarkup, capaActiva, lightStates, internetSignals),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlantSvgPreview({
  svgMarkup,
  capaActiva,
  internetSignals,
  lightStates,
}: {
  svgMarkup: string;
  capaActiva: CapaActiva;
  internetSignals: Record<string, NetworkSignalQuality>;
  lightStates: Record<string, boolean>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e2edf6] bg-white">
      <div
        className="aspect-[16/9] max-h-32 w-full p-1.5 [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-none [&_svg]:object-contain"
        dangerouslySetInnerHTML={{
          __html: getPreviewSvgMarkup(svgMarkup, capaActiva, lightStates, internetSignals),
        }}
      />
    </div>
  );
}

function getPlantsForAla(plants: InteriorOverviewProps["overviewLightAreas"], ala: Ala) {
  return plantDisplayOrder
    .map((planta) => plants.find((item) => item.ala === ala && item.planta === planta))
    .filter(isOverviewPlant);
}

function isOverviewPlant(value: OverviewPlant | undefined): value is OverviewPlant {
  return Boolean(value);
}

function getPreviewSvgMarkup(
  svgMarkup: string,
  capaActiva: CapaActiva,
  lightStates: Record<string, boolean>,
  internetSignals: Record<string, NetworkSignalQuality>,
) {
  const baseMarkup = applyLayerVisibilityToSvgMarkup(svgMarkup, capaActiva);
  const allInteractiveIds = getInteractiveSvgIds(extractSvgIds(baseMarkup));
  const activeAreaIds = extractActiveAreaSvgIds(baseMarkup);
  const resolvedLightAreaIds = Array.from(
    new Set([...getIdsForLayer(allInteractiveIds, "luces"), ...activeAreaIds]),
  );
  const resolvedLayerIds = Array.from(
    new Set([
      ...getIdsForLayer(allInteractiveIds, capaActiva),
      ...(capaActiva === "internet"
        ? activeAreaIds.filter(isInternetAreaAllowed)
        : activeAreaIds),
    ]),
  );
  const interactiveIds = capaActiva === "luces" ? resolvedLightAreaIds : resolvedLayerIds;
  const activeAreaSet = new Set(
    capaActiva === "internet" ? activeAreaIds.filter(isInternetAreaAllowed) : activeAreaIds,
  );
  const interactiveIdSet = new Set(interactiveIds);

  if (interactiveIdSet.size === 0 && activeAreaSet.size === 0) {
    return baseMarkup;
  }

  const tokens = previewLayerStyles[capaActiva];

  return baseMarkup.replace(
    /<([a-zA-Z][^>]*\sid="([^"]+)"[^>]*?)(\s*\/?)>/gi,
    (fullMatch, tagBody: string, id: string, closing: string) => {
      if (isPcSvgElement(id)) {
        return fullMatch;
      }

      const shouldHighlight = interactiveIdSet.has(id) || activeAreaSet.has(id);

      if (!shouldHighlight) {
        return fullMatch;
      }

      const isLightOff =
        capaActiva === "luces" && resolvedLightAreaIds.includes(id) && !(lightStates[id] ?? true);
      const internetSignalStyles =
        capaActiva === "internet"
          ? getInternetSignalStylesFromQuality(internetSignals[id] ?? "desconectada")
          : null;
      const fill = isLightOff ? "#cf6f6f" : internetSignalStyles?.fill ?? tokens.fill;
      const stroke = isLightOff ? "#dc2626" : internetSignalStyles?.stroke ?? tokens.stroke;
      const previewStyle = `fill:${fill};stroke:${stroke};stroke-width:6;opacity:0.94`;

      if (/style="/i.test(tagBody)) {
        return `<${tagBody.replace(/style="([^"]*)"/i, `style="$1;${previewStyle}"`)}${closing}>`;
      }

      return `<${tagBody} style="${previewStyle}"${closing}>`;
    },
  );
}

function isInternetAreaAllowed(id: string) {
  return !/(^pasillos_|pasillos_|ba.*os_|sanitarios_)/i.test(id);
}

function getInternetSignalStylesFromQuality(quality: NetworkSignalQuality) {
  if (quality === "desconectada") {
    return {
      fill: "#e5e7eb",
      stroke: "#cbd5e1",
    };
  }

  if (quality === "buena") {
    return {
      fill: "#bbf7d0",
      stroke: "#22c55e",
    };
  }

  if (quality === "regular") {
    return {
      fill: "#fef3c7",
      stroke: "#f59e0b",
    };
  }

  return {
    fill: "#fecaca",
    stroke: "#ef4444",
  };
}

function buildInteriorHref(searchParams: URLSearchParams, ala: Ala | null) {
  const params = new URLSearchParams(searchParams.toString());

  if (ala) {
    params.set("ala", ala);
  } else {
    params.delete("ala");
  }

  const query = params.toString();

  return query ? `/interior?${query}` : "/interior";
}
