"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { usePlantaUi } from "@/components/layout/planta-ui-context";
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
    idleFill: "rgba(255, 226, 122, 0.28)",
    idleStroke: "#d7a100",
    activeFill: "rgba(255, 208, 78, 0.52)",
    activeStroke: "#b98500",
  },
  aire: {
    idleFill: "rgba(118, 222, 180, 0.24)",
    idleStroke: "#27a36d",
    activeFill: "rgba(86, 205, 159, 0.46)",
    activeStroke: "#15885a",
  },
  internet: {
    idleFill: "rgba(102, 195, 255, 0.24)",
    idleStroke: "#2b9ee8",
    activeFill: "rgba(66, 184, 255, 0.48)",
    activeStroke: "#0b84d8",
  },
};

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
    () => Array.from(new Set([...getIdsForLayer(allInteractiveIds, capaActiva), ...activeAreaIds])),
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
    const activeAreaSet = new Set(activeAreaIds);
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

        if (!isOn) {
          element.style.opacity = "0.32";
          element.style.fill = "rgba(239, 68, 68, 0.20)";
          element.style.stroke = "#dc2626";
          element.style.strokeWidth = "8px";
          element.style.filter = "";
          element.setAttribute("opacity", "0.32");
          element.setAttribute("fill", "rgba(239, 68, 68, 0.20)");
          element.setAttribute("stroke", "#dc2626");
          element.setAttribute("stroke-width", "8");
        }
      });
    };

    svgRoot.querySelectorAll<SVGElement>("[id]").forEach((element) => {
      const id = element.id;
      const isPcElement = isPcSvgElement(id);
      const preserveFill = element.getAttribute("data-preserve-fill") === "true";

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

      element.setAttribute("data-interactive", "true");
      if (isSelected) {
        element.setAttribute("data-selected", "true");
      }

      element.style.cursor = "pointer";
      element.style.opacity = isSelected ? "1" : "0.94";
      element.setAttribute("opacity", isSelected ? "1" : "0.94");
      if (!preserveFill || isSelected) {
        element.style.fill = isSelected ? tokens.activeFill : tokens.idleFill;
        element.setAttribute("fill", isSelected ? tokens.activeFill : tokens.idleFill);
      }
      element.style.stroke = isSelected ? tokens.activeStroke : tokens.idleStroke;
      element.style.strokeWidth = isSelected ? "12px" : "8px";
      element.setAttribute("stroke", isSelected ? tokens.activeStroke : tokens.idleStroke);
      element.setAttribute("stroke-width", isSelected ? "12" : "8");
      element.style.filter = isSelected ? "drop-shadow(0 0 10px rgba(34, 148, 238, 0.22))" : "";

      if (
        !isPcElement &&
        rootMatrix &&
        typeof (element as SVGGraphicsElement).getBBox === "function"
      ) {
        try {
          const bbox = (element as SVGGraphicsElement).getBBox();
          const rect = (element as SVGGraphicsElement).getBoundingClientRect();

          if (bbox.width > 0 && bbox.height > 0 && rect.width > 24 && rect.height > 24) {
            rootPoint.x = rect.left + rect.width / 2;
            rootPoint.y = rect.top + rect.height / 2;
            const centerPoint = rootPoint.matrixTransform(rootMatrix.inverse());

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const labelLines = splitSvgElementLabelLines(id);
            const fontSize =
              ala === "oeste"
                ? Math.max(18, Math.min(44, bbox.width / 10))
                : Math.max(42, Math.min(96, bbox.width / 7));
            const lineHeight = fontSize * 0.9;
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
            text.setAttribute("stroke-width", "14");
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
  }, [capaActiva, interactiveIds, lightAreaIds, lightStates, pathname, renderedSvgMarkup, selectedId]);

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
