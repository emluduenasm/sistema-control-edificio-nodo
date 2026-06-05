import { InteriorOverview } from "@/components/interior/interior-overview";
import { loadSvgMarkup } from "@/lib/svg/load-svg";
import { alas, getPlantaSvgPath, plantas } from "@/lib/svg/planta-map";
import {
  extractActiveAreaSvgIds,
  extractSvgIds,
  getIdsForLayer,
  getInteractiveSvgIds,
} from "@/lib/svg/svg-interaction";

export default async function InteriorPage() {
  const overviewLightAreas = await Promise.all(
    alas.flatMap((ala) =>
      plantas.map(async (planta) => {
        const svgPath = getPlantaSvgPath(ala, planta);
        const svgMarkup = await loadSvgMarkup(svgPath);
        const allInteractiveIds = getInteractiveSvgIds(extractSvgIds(svgMarkup));
        const activeAreaIds = extractActiveAreaSvgIds(svgMarkup);
        const inferredLightAreaIds = getIdsForLayer(allInteractiveIds, "luces");
        const areaIds = Array.from(new Set([...inferredLightAreaIds, ...activeAreaIds]));

        return {
          ala,
          areaIds,
          planta,
        };
      }),
    ),
  );

  return <InteriorOverview overviewLightAreas={overviewLightAreas} />;
}
