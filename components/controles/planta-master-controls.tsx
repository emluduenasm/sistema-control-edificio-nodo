import type { CapaActiva } from "@/types/building";

type PlantaMasterControlsProps = {
  capaActiva: CapaActiva;
};

export function PlantaMasterControls({ capaActiva }: PlantaMasterControlsProps) {
  return (
    <div className="rounded-lg border border-nodo-line bg-slate-50 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        Control general
      </p>
      <h2 className="mt-2 text-xl font-semibold capitalize">{capaActiva}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Panel reservado para acciones masivas por planta, permisos y confirmaciones operativas.
      </p>
    </div>
  );
}
