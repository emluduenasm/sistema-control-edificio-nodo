"use client";

import { useSearchParams } from "next/navigation";

import { AireControls } from "@/components/controles/aire-controls";
import { InternetSummary } from "@/components/controles/internet-summary";
import { LucesControls } from "@/components/controles/luces-controls";
import { PlantaMasterControls } from "@/components/controles/planta-master-controls";
import { isCapaActiva } from "@/lib/svg/planta-map";
import type { CapaActiva } from "@/types/building";

export function BottomPanel() {
  const searchParams = useSearchParams();
  const capaParam = searchParams.get("capa");
  const capaActiva: CapaActiva = isCapaActiva(capaParam) ? capaParam : "luces";

  return (
    <footer className="border-t border-nodo-line bg-white px-6 py-4">
      <div className="grid h-full min-h-0 grid-cols-[280px_1fr] gap-5">
        <PlantaMasterControls capaActiva={capaActiva} />
        <div className="min-h-0">
          {capaActiva === "luces" && <LucesControls />}
          {capaActiva === "aire" && <AireControls />}
          {capaActiva === "internet" && <InternetSummary />}
        </div>
      </div>
    </footer>
  );
}
