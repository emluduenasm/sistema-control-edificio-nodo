"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { usePlantaUi } from "@/components/layout/planta-ui-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { isAla, isCapaActiva } from "@/lib/svg/planta-map";
import { getPlantKey } from "@/lib/svg/svg-events";
import { cn } from "@/lib/utils";
import { formatLabel } from "@/lib/utils/format";
import type { Ala, CapaActiva, Planta } from "@/types/building";

type InteriorOverviewProps = {
  overviewLightAreas: Array<{
    ala: Ala;
    areaIds: string[];
    planta: Planta;
  }>;
};

const layerLabels: Record<CapaActiva, string> = {
  aire: "Aire",
  internet: "Internet",
  luces: "Luces",
};

export function InteriorOverview({ overviewLightAreas }: InteriorOverviewProps) {
  const searchParams = useSearchParams();
  const { setCurrentPlantLightAreas } = usePlantaUi();
  const capaParam = searchParams.get("capa");
  const alaParam = searchParams.get("ala");
  const currentCapa: CapaActiva = isCapaActiva(capaParam) ? capaParam : "luces";
  const currentAla: Ala | null = isAla(alaParam) ? alaParam : null;

  useEffect(() => {
    overviewLightAreas.forEach(({ ala, areaIds, planta }) => {
      setCurrentPlantLightAreas(getPlantKey(ala, planta), areaIds);
    });
  }, [overviewLightAreas, setCurrentPlantLightAreas]);

  const visiblePlants = currentAla
    ? overviewLightAreas.filter((item) => item.ala === currentAla)
    : [];

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">Interior</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#173863]">
              {currentAla ? `Ala ${currentAla}` : "Seleccion de ala"}
            </h1>
            <p className="mt-2 text-[#6b87a1]">
              {currentAla
                ? "Primero elegiste el ala. Ahora selecciona la planta que quieras abrir."
                : "Primero elige un ala. Luego mostramos las plantas disponibles de esa ala."}
            </p>
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
                <CardHeader className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7190ab]">
                    Paso 1
                  </p>
                  <CardTitle className="text-2xl capitalize text-[#173863]">{`Ala ${ala}`}</CardTitle>
                  <p className="text-sm text-[#6f88a0]">
                    Ver plantas disponibles y controles de luces por ala.
                  </p>
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
            {visiblePlants.map(({ ala, planta }) => (
              <Link key={`${ala}-${planta}`} href={`/interior/${ala}/${planta}?capa=${currentCapa}`}>
                <Card className="h-full border-[#d9e8f4] bg-[#fbfeff] transition hover:border-[#8bd6ff] hover:shadow-pill">
                  <CardHeader className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7190ab]">
                      Paso 2
                    </p>
                    <CardTitle className="text-xl text-[#173863]">{formatLabel(planta)}</CardTitle>
                    <p className="text-sm text-[#6f88a0]">Abrir plano y controles de esa planta.</p>
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
