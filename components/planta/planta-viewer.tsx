import { PlantaSvg } from "@/components/planta/planta-svg";
import { dispositivosMock } from "@/lib/mock/estados.mock";
import { zonasMock } from "@/lib/mock/zonas.mock";
import { getPlantaSvgPath } from "@/lib/svg/planta-map";
import { formatLabel } from "@/lib/utils/format";
import type { Ala, CapaActiva, Planta } from "@/types/building";

type PlantaViewerProps = {
  ala: Ala;
  planta: Planta;
  capaActiva: CapaActiva;
};

const estadoStyles = {
  normal: "bg-emerald-100 text-emerald-800",
  advertencia: "bg-amber-100 text-amber-800",
  critico: "bg-rose-100 text-rose-800",
  apagado: "bg-slate-100 text-slate-600",
};

export function PlantaViewer({ ala, planta, capaActiva }: PlantaViewerProps) {
  const svgPath = getPlantaSvgPath(ala, planta);
  const zonas = zonasMock.filter((zona) => zona.ala === ala && zona.planta === planta);
  const dispositivos = dispositivosMock.filter((dispositivo) =>
    zonas.some((zona) => zona.id === dispositivo.zonaId),
  );

  return (
    <section className="grid h-full grid-rows-[auto_1fr] gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nodo-accent">
            Ala {ala}
          </p>
          <h1 className="text-2xl font-semibold capitalize">{formatLabel(planta)}</h1>
        </div>
        <div className="rounded-lg border border-nodo-line bg-white px-4 py-2 text-sm">
          Capa activa: <span className="font-semibold capitalize">{capaActiva}</span>
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-[1fr_300px] gap-5">
        <div className="relative min-h-0 overflow-hidden rounded-lg border border-nodo-line bg-white shadow-sm">
          {svgPath ? (
            <PlantaSvg ala={ala} planta={planta} src={svgPath} />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              No hay SVG configurado para esta planta.
            </div>
          )}

          <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-nodo-line bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
            Preparado para aplicar estilos por <code>svgSelector</code> segun capa y estado.
          </div>
        </div>

        <aside className="min-h-0 overflow-auto rounded-lg border border-nodo-line bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Zonas simuladas
          </h2>
          <div className="mt-4 space-y-3">
            {zonas.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay zonas mock cargadas para esta planta todavia.
              </p>
            ) : (
              zonas.map((zona) => (
                <div key={zona.id} className="rounded-md border border-nodo-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{zona.nombre}</p>
                      <p className="mt-1 text-xs text-slate-500">{zona.svgSelector}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${estadoStyles[zona.estado]}`}>
                      {zona.estado}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {zona.temperaturaC ?? "-"} C · {zona.ocupacion ?? 0} personas
                  </p>
                </div>
              ))
            )}
          </div>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Dispositivos
          </h3>
          <p className="mt-2 text-sm text-slate-600">{dispositivos.length} asociados a esta planta.</p>
        </aside>
      </div>
    </section>
  );
}
