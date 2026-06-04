"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { capasActivas, isCapaActiva } from "@/lib/svg/planta-map";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col items-stretch gap-1 rounded-[20px] border border-border/80 bg-white/80 p-1 shadow-pill">
      {capasActivas.map((capa) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("capa", capa);
        params.delete("sector");
        const href = `${pathname}?${params.toString()}`;

        return (
          <a
            key={capa}
            href={href}
            className={cn(
              "inline-flex min-w-24 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all",
              capa === capaActiva
                ? "border border-border/90 bg-secondary text-[#2294ee] shadow-pill"
                : "text-[#6d89a6] hover:bg-background/80 hover:text-[#173863]",
            )}
          >
            {layerLabels[capa]}
          </a>
        );
      })}
    </div>
  );
}
