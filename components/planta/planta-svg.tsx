"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { usePlantaUi } from "@/components/layout/planta-ui-context";
import type { NetworkSignalQuality } from "@/lib/network/network-status";
import {
  applyLayerVisibilityToSvgMarkup,
  extractActiveAreaSvgIds,
  extractSvgIds,
  getIdsForLayer,
  getInteractiveSvgIds,
  isPcSvgElement,
  splitSvgElementLabelLines,
} from "@/lib/svg/svg-interaction";
import { formatLabel } from "@/lib/utils/format";
import type { Ala, CapaActiva, Planta } from "@/types/building";

type PlantaSvgProps = {
  ala: Ala;
  planta: Planta;
  svgMarkup: string;
  capaActiva: CapaActiva;
  selectedId: string | null;
  onIdsChange?: (ids: string[]) => void;
};

const layerStyles: Record<
  CapaActiva,
  { idleFill: string; idleStroke: string; activeFill: string; activeStroke: string }
> = {
  luces: {
    idleFill: "#f6db63",
    idleStroke: "#d7a100",
    activeFill: "#e0ae00",
    activeStroke: "#b98500",
  },
  aire: {
    idleFill: "#94e0b8",
    idleStroke: "#27a36d",
    activeFill: "#59c98d",
    activeStroke: "#15885a",
  },
  internet: {
    idleFill: "#8fd3ff",
    idleStroke: "#2b9ee8",
    activeFill: "#49b5ff",
    activeStroke: "#0b84d8",
  },
};

const opaqueLayerFills: Record<
  CapaActiva,
  { idleFill: string; activeFill: string; offFill: string; idleOpacity: string; offOpacity: string }
> = {
  luces: {
    idleFill: "#f6db63",
    activeFill: "#e0ae00",
    offFill: "#cf6f6f",
    idleOpacity: "1",
    offOpacity: "1",
  },
  aire: {
    idleFill: "#94e0b8",
    activeFill: "#59c98d",
    offFill: "#94e0b8",
    idleOpacity: "0.94",
    offOpacity: "0.94",
  },
  internet: {
    idleFill: "#8fd3ff",
    activeFill: "#49b5ff",
    offFill: "#8fd3ff",
    idleOpacity: "0.94",
    offOpacity: "0.94",
  },
};

function isInternetAreaAllowed(id: string) {
  return !/(^pasillos_|pasillos_|ba.*os_|sanitarios_)/i.test(id);
}

function getPcShortLabel(id: string) {
  const match = id.match(/^pc(\d+)(?:_|$)/i);

  return match?.[1] ?? null;
}

export function PlantaSvg({
  ala,
  planta,
  svgMarkup,
  capaActiva,
  selectedId,
  onIdsChange,
}: PlantaSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { lightStates } = usePlantaUi();
  const [liveInternetSignals, setLiveInternetSignals] = useState<Record<string, NetworkSignalQuality>>({});

  const allInteractiveIds = useMemo(() => {
    if (!svgMarkup.trim()) {
      return [];
    }

    return getInteractiveSvgIds(extractSvgIds(svgMarkup));
  }, [svgMarkup]);

  const activeAreaIds = useMemo(() => {
    if (!svgMarkup.trim()) {
      return [];
    }

    return extractActiveAreaSvgIds(svgMarkup);
  }, [svgMarkup]);

  const inferredLightAreaIds = useMemo(
    () => getIdsForLayer(allInteractiveIds, "luces"),
    [allInteractiveIds],
  );

  const resolvedLightAreaIds = useMemo(
    () => Array.from(new Set([...inferredLightAreaIds, ...activeAreaIds])),
    [activeAreaIds, inferredLightAreaIds],
  );

  const resolvedLayerIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...getIdsForLayer(allInteractiveIds, capaActiva),
          ...(capaActiva === "internet"
            ? activeAreaIds.filter(isInternetAreaAllowed)
            : activeAreaIds),
        ]),
      ),
    [activeAreaIds, allInteractiveIds, capaActiva],
  );

  const interactiveIds = useMemo(
    () => (capaActiva === "luces" ? resolvedLightAreaIds : resolvedLayerIds),
    [capaActiva, resolvedLayerIds, resolvedLightAreaIds],
  );

  const lightAreaIds = resolvedLightAreaIds;

  const renderedSvgMarkup = useMemo(
    () => applyLayerVisibilityToSvgMarkup(svgMarkup, capaActiva),
    [capaActiva, svgMarkup],
  );

  useEffect(() => {
    onIdsChange?.(interactiveIds);
  }, [interactiveIds, onIdsChange]);

  useEffect(() => {
    if (capaActiva !== "internet") {
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
        // Keep the last known state if the refresh fails.
      }
    };

    void syncNetworkStatus();
    const intervalId = window.setInterval(syncNetworkStatus, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [capaActiva]);

  useEffect(() => {
    if (!selectedId || interactiveIds.includes(selectedId)) {
      return;
    }

    const params = new URLSearchParams();
    params.set("capa", capaActiva);
    params.delete("sector");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [capaActiva, interactiveIds, pathname, router, selectedId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const svgRoot = container.querySelector("svg");
    if (!svgRoot) {
      return;
    }

    svgRoot.setAttribute("data-planta-svg-root", "true");

    const tokens = layerStyles[capaActiva];
    const idSet = new Set(interactiveIds);
    const activeAreaSet = new Set(
      capaActiva === "internet" ? activeAreaIds.filter(isInternetAreaAllowed) : activeAreaIds,
    );
    const currentLightStates = lightStates;
    const labelLayer =
      svgRoot.querySelector<SVGGElement>("[data-generated-label-layer='true']") ??
      document.createElementNS("http://www.w3.org/2000/svg", "g");

    labelLayer.setAttribute("data-generated-label-layer", "true");
    labelLayer.style.pointerEvents = "none";
    labelLayer.replaceChildren();

    if (!labelLayer.parentNode) {
      svgRoot.appendChild(labelLayer);
    }

    const rootMatrix = svgRoot.getScreenCTM();
    const rootPoint = svgRoot.createSVGPoint();

    const applyLightStates = () => {
      svgRoot.querySelectorAll<SVGElement>("[id]").forEach((element) => {
        const id = element.id;

        if (!lightAreaIds.includes(id) || capaActiva !== "luces") {
          return;
        }

        const isOn = currentLightStates[id] ?? true;
        const useOpaqueLayerFill = element.getAttribute("data-opaque-layer-fill") === "true";
        const useOpaqueLights = capaActiva === "luces";

        if (!isOn) {
          const offOpacity =
            useOpaqueLights || useOpaqueLayerFill ? opaqueLayerFills.luces.offOpacity : "0.32";
          element.style.opacity = offOpacity;
          element.style.fill = useOpaqueLights || useOpaqueLayerFill
            ? opaqueLayerFills.luces.offFill
            : "rgba(239, 68, 68, 0.20)";
          element.style.stroke = "#dc2626";
          element.style.strokeWidth = "8px";
          element.style.filter = "";
          element.setAttribute("opacity", offOpacity);
          element.setAttribute(
            "fill",
            useOpaqueLights || useOpaqueLayerFill
              ? opaqueLayerFills.luces.offFill
              : "rgba(239, 68, 68, 0.20)",
          );
          element.setAttribute("stroke", "#dc2626");
          element.setAttribute("stroke-width", "8");
        }
      });
    };

    svgRoot.querySelectorAll<SVGElement>("[id]").forEach((element) => {
      const id = element.id;
      const isPcElement = isPcSvgElement(id);
      const preserveFill = element.getAttribute("data-preserve-fill") === "true";
      const useOpaqueLayerFill = element.getAttribute("data-opaque-layer-fill") === "true";
      const useOpaqueLights = capaActiva === "luces";

      element.removeAttribute("data-interactive");
      element.removeAttribute("data-selected");
      element.style.cursor = "";
      element.style.display = "";
      element.style.visibility = "";
      element.style.opacity = "";
      element.style.fill = "";
      element.style.stroke = "";
      element.style.strokeWidth = "";
      element.style.filter = "";
      element.removeAttribute("opacity");
      element.removeAttribute("fill");
      element.removeAttribute("stroke");
      element.removeAttribute("stroke-width");

      if (isPcElement && capaActiva !== "internet") {
        element.style.display = "none";
        return;
      }

      const shouldHighlight = idSet.has(id) || activeAreaSet.has(id);

      if (!shouldHighlight) {
        return;
      }

      const isSelected = selectedId === id;
      const liveSignalQuality = capaActiva === "internet" ? liveInternetSignals[id] ?? "desconectada" : null;
      const internetSignalStyles =
        capaActiva === "internet"
          ? getInternetSignalStylesFromQuality(
              liveSignalQuality,
              isSelected,
              isPcElement,
            )
          : null;

      element.setAttribute("data-interactive", "true");
      if (isSelected) {
        element.setAttribute("data-selected", "true");
      }

      element.style.cursor = "pointer";
      if (!preserveFill || isSelected || useOpaqueLayerFill || useOpaqueLights) {
        const resolvedFill = internetSignalStyles
          ? internetSignalStyles.fill
          : useOpaqueLayerFill && capaActiva !== "luces"
            ? isSelected
              ? tokens.activeFill
              : tokens.idleFill
            : useOpaqueLayerFill
              ? isSelected
                ? opaqueLayerFills[capaActiva].activeFill
                : opaqueLayerFills[capaActiva].idleFill
              : useOpaqueLights
                ? isSelected
                  ? opaqueLayerFills.luces.activeFill
                  : opaqueLayerFills.luces.idleFill
                : isSelected
                  ? tokens.activeFill
                  : tokens.idleFill;
        element.style.fill = resolvedFill;
        element.setAttribute("fill", resolvedFill);
      }
      const resolvedOpacity = useOpaqueLayerFill && capaActiva !== "luces"
        ? isSelected
          ? "1"
          : "0.94"
        : useOpaqueLayerFill
        ? isSelected
          ? "1"
          : opaqueLayerFills[capaActiva].idleOpacity
        : useOpaqueLights
        ? isSelected
          ? "1"
          : opaqueLayerFills.luces.idleOpacity
        : isSelected
          ? "1"
          : "0.94";
      element.style.opacity = resolvedOpacity;
      element.setAttribute("opacity", resolvedOpacity);
      element.style.stroke = internetSignalStyles
        ? internetSignalStyles.stroke
        : isSelected
          ? tokens.activeStroke
          : tokens.idleStroke;
      element.style.strokeWidth = isSelected ? "12px" : "8px";
      element.setAttribute(
        "stroke",
        internetSignalStyles
          ? internetSignalStyles.stroke
          : isSelected
            ? tokens.activeStroke
            : tokens.idleStroke,
      );
      element.setAttribute("stroke-width", isSelected ? "12" : "8");
      element.style.filter = isSelected ? "drop-shadow(0 0 10px rgba(34, 148, 238, 0.22))" : "";

      if (rootMatrix && typeof (element as SVGGraphicsElement).getBBox === "function") {
        try {
          const bbox = (element as SVGGraphicsElement).getBBox();
          const rect = (element as SVGGraphicsElement).getBoundingClientRect();

          const pcShortLabel = capaActiva === "internet" && isPcElement ? getPcShortLabel(id) : null;
          const canRenderAreaLabel = !isPcElement && rect.width > 24 && rect.height > 24;
          const canRenderPcLabel = Boolean(pcShortLabel) && rect.width > 8 && rect.height > 8;

          if (bbox.width > 0 && bbox.height > 0 && (canRenderAreaLabel || canRenderPcLabel)) {
            rootPoint.x = rect.left + rect.width / 2;
            rootPoint.y = rect.top + rect.height / 2;
            const centerPoint = rootPoint.matrixTransform(rootMatrix.inverse());

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const labelLines = pcShortLabel ? [pcShortLabel] : splitSvgElementLabelLines(id);
            const fontSize = pcShortLabel
              ? Math.max(48, Math.min(76, Math.max(bbox.width, bbox.height) * 4.4))
              : ala === "oeste"
                ? Math.max(12, Math.min(26, bbox.width / 15))
                : Math.max(42, Math.min(96, bbox.width / 7));
            const lineHeight = pcShortLabel ? fontSize : fontSize * 0.9;
            const startOffset = -((labelLines.length - 1) * lineHeight) / 2;

            text.setAttribute("data-generated-label", "true");
            text.setAttribute("x", String(centerPoint.x));
            text.setAttribute("y", String(centerPoint.y));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", String(fontSize));
            text.setAttribute("font-weight", "700");
            text.setAttribute("fill", "#173863");
            text.setAttribute("paint-order", "stroke");
            text.setAttribute("stroke", "rgba(255,255,255,0.95)");
            text.setAttribute("stroke-width", pcShortLabel ? "10" : "8");
            text.style.pointerEvents = "none";

            labelLines.forEach((line, index) => {
              const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
              tspan.setAttribute("x", String(centerPoint.x));
              tspan.setAttribute("y", String(centerPoint.y + startOffset + index * lineHeight));
              tspan.textContent = line;
              text.appendChild(tspan);
            });

            labelLayer.appendChild(text);
          }
        } catch {
          // Some SVG nodes may not expose a stable bbox.
        }
      }
    });

    applyLightStates();
  }, [capaActiva, interactiveIds, lightAreaIds, lightStates, liveInternetSignals, pathname, renderedSvgMarkup, selectedId]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const svgElement = target.closest("[id]") as SVGElement | null;

    if (!svgElement || (!interactiveIds.includes(svgElement.id) && !activeAreaIds.includes(svgElement.id))) {
      return;
    }

    const params = new URLSearchParams();
    params.set("capa", capaActiva);

    if (selectedId !== svgElement.id) {
      params.set("sector", svgElement.id);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative h-full w-full overflow-auto" onClick={handleClick} ref={containerRef}>
      <div
        className="mx-auto h-full min-h-[420px] w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-none [&_svg]:object-contain"
        dangerouslySetInnerHTML={{ __html: renderedSvgMarkup }}
      />

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-border bg-white/92 px-3 py-2 text-xs text-[#718aa3] shadow-pill">
        Ala {ala} - {formatLabel(planta)} - {interactiveIds.length} IDs reales interactivos
      </div>
    </div>
  );
}

function getInternetSignalStylesFromQuality(
  quality: NetworkSignalQuality,
  isSelected: boolean,
  isPcElement: boolean,
) {
  if (quality === "desconectada") {
    return {
      fill: isPcElement
        ? isSelected
          ? "#6b7280"
          : "#9ca3af"
        : isSelected
          ? "#d1d5db"
          : "#e5e7eb",
      stroke: isPcElement
        ? isSelected
          ? "#4b5563"
          : "#6b7280"
        : isSelected
          ? "#9ca3af"
          : "#cbd5e1",
    };
  }

  if (quality === "buena") {
    return {
      fill: isPcElement
        ? isSelected
          ? "#16a34a"
          : "#22c55e"
        : isSelected
          ? "#86efac"
          : "#bbf7d0",
      stroke: isPcElement
        ? isSelected
          ? "#166534"
          : "#15803d"
        : isSelected
          ? "#16a34a"
          : "#22c55e",
    };
  }

  if (quality === "regular") {
    return {
      fill: isPcElement
        ? isSelected
          ? "#eab308"
          : "#facc15"
        : isSelected
          ? "#fde68a"
          : "#fef3c7",
      stroke: isPcElement
        ? isSelected
          ? "#a16207"
          : "#ca8a04"
        : isSelected
          ? "#d97706"
          : "#f59e0b",
    };
  }

  return {
    fill: isPcElement
      ? isSelected
        ? "#dc2626"
        : "#ef4444"
      : isSelected
        ? "#fca5a5"
        : "#fecaca",
    stroke: isPcElement
      ? isSelected
        ? "#991b1b"
        : "#b91c1c"
      : isSelected
        ? "#dc2626"
        : "#ef4444",
  };
}
