"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { alas, isAla, isPlanta, plantas } from "@/lib/svg/planta-map";
import { cn } from "@/lib/utils";
import { formatLabel } from "@/lib/utils/format";

export function PlantaRouteSelector() {
  const params = useParams<{ ala?: string; planta?: string }>();
  const searchParams = useSearchParams();

  if (!isAla(params?.ala ?? "") || !isPlanta(params?.planta ?? "")) {
    return null;
  }

  const currentAla = params.ala as (typeof alas)[number];
  const currentPlanta = params.planta as (typeof plantas)[number];

  return (
    <div className="flex items-center gap-3">
      <SelectorGroup
        items={alas}
        isActive={(ala) => ala === currentAla}
        getHref={(ala) => buildHref(ala, currentPlanta, searchParams)}
        getLabel={(ala) => `Ala ${ala}`}
      />
      <SelectorGroup
        items={plantas}
        isActive={(planta) => planta === currentPlanta}
        getHref={(planta) => buildHref(currentAla, planta, searchParams)}
        getLabel={(planta) => formatLabel(planta)}
      />
    </div>
  );
}

function SelectorGroup<TItem extends string>({
  items,
  isActive,
  getHref,
  getLabel,
}: {
  items: readonly TItem[];
  isActive: (item: TItem) => boolean;
  getHref: (item: TItem) => string;
  getLabel: (item: TItem) => string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border/80 bg-white/80 p-1 shadow-pill">
      {items.map((item) => (
        <Link
          key={item}
          href={getHref(item)}
          scroll={false}
          className={cn(
            "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all",
            isActive(item)
              ? "border border-border/90 bg-secondary text-[#2294ee] shadow-pill"
              : "text-[#6d89a6] hover:bg-background/80 hover:text-[#173863]",
          )}
        >
          {getLabel(item)}
        </Link>
      ))}
    </div>
  );
}

function buildHref(ala: string, planta: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("sector");
  const query = params.toString();

  return query
    ? `/interior/${ala}/${planta}?${query}`
    : `/interior/${ala}/${planta}`;
}
