"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { capasActivas, isCapaActiva } from "@/lib/svg/planta-map";

const layerLabels = {
  luces: "Luces",
  aire: "Aire",
  internet: "Internet",
};

export function LayerSelector() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const capaParam = searchParams.get("capa");
  const capaActiva = isCapaActiva(capaParam) ? capaParam : "luces";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-nodo-line bg-slate-50 p-1">
      {capasActivas.map((capa) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("capa", capa);

        return (
          <Link
            key={capa}
            href={`${pathname}?${params.toString()}`}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              capa === capaActiva
                ? "bg-white text-nodo-accent shadow-sm"
                : "text-slate-600 hover:text-nodo-ink"
            }`}
          >
            {layerLabels[capa]}
          </Link>
        );
      })}
    </div>
  );
}
