"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatSvgElementLabel, getSvgElementKind } from "@/lib/svg/svg-interaction";
import type { CapaActiva } from "@/types/building";

type SectorControlsProps = {
  capaActiva: CapaActiva;
  selectedId: string | null;
  lightAreaIds?: string[];
  lightStates?: Record<string, boolean>;
  onToggleLight?: (ids: string[]) => void;
};

type LightAreaGroup = {
  ids: string[];
  label: string;
};

const layerActions: Record<CapaActiva, string[]> = {
  luces: ["Encender", "Apagar", "Escena"],
  aire: ["Setpoint", "Ventilacion", "Eco"],
  internet: ["Ping", "Revisar puerto", "Aislar"],
};

const layerDescriptions: Record<CapaActiva, string> = {
  luces: "Lista real de areas del SVG con control individual del estado de iluminacion.",
  aire: "Desde aca se aplican consignas y modos sobre el ambiente o servicio elegido en el SVG.",
  internet: "El panel inferior concentra el diagnostico del nodo, equipo o ambiente seleccionado.",
};

export function SectorControls({
  capaActiva,
  selectedId,
  lightAreaIds = [],
  lightStates = {},
  onToggleLight,
}: SectorControlsProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const lightAreaGroups = getLightAreaGroups(lightAreaIds);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (capaActiva === "luces") {
    return (
      <div className="h-full min-h-0">
        <div className="flex h-full min-h-0 flex-col rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
          <p className="text-sm font-medium text-[#6a88a5]">Interaccion principal</p>
          <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="grid min-h-0 gap-2 overflow-auto pr-1 md:grid-cols-3 xl:grid-cols-5">
              {(isHydrated ? lightAreaGroups : []).map((group) => {
                const isOn = group.ids.every((id) => lightStates[id] ?? true);

                return (
                  <div
                    key={group.ids.join("|")}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#d8e6f2] bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#173863]">
                        {group.label}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7b93ab]">
                        {isOn ? "Encendida" : "Apagada"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => onToggleLight?.(group.ids)}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
                        isOn
                          ? "border-emerald-300 bg-emerald-500"
                          : "border-rose-300 bg-rose-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                          isOn ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedId) {
    return (
      <div className="grid h-full grid-cols-[1.3fr_1fr_1fr] gap-4">
        <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
          <p className="text-sm font-medium text-[#6a88a5]">Interaccion principal</p>
          <p className="mt-2 text-2xl font-semibold text-[#173863]">Areas activas</p>
          <p className="mt-1 text-sm text-[#6f88a0]">
            Los sectores activos del SVG siguen disponibles en esta capa.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(isHydrated ? lightAreaGroups : []).map((group) => (
              <span
                key={group.ids.join("|")}
                className="rounded-full border border-[#d8e6f2] bg-white px-3 py-1 text-xs font-medium text-[#4d6f8f]"
              >
                {group.label}
              </span>
            ))}
          </div>
        </div>
        <InfoCard
          title="Capa activa"
          value={capaActiva}
          detail="El resaltado del SVG ya filtra por esta capa."
        />
        <InfoCard
          title="Origen"
          value="public/planos"
          detail="Sin zonas simuladas en el panel lateral."
        />
      </div>
    );
  }

  const label = formatSvgElementLabel(selectedId);
  const kind = getSvgElementKind(selectedId);

  return (
    <div className="grid h-full grid-cols-[1.4fr_1fr_1fr] gap-4">
      <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
        <p className="text-sm font-medium text-[#6a88a5]">Seleccion actual</p>
        <p className="mt-2 text-2xl font-semibold text-[#173863]">{label}</p>
        <p className="mt-1 break-all text-sm text-[#6f88a0]">{selectedId}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {layerActions[capaActiva].map((action) => (
            <Button
              key={action}
              size="sm"
              variant={action === layerActions[capaActiva][0] ? "default" : "secondary"}
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      <InfoCard title="Tipo" value={kind} detail="Inferido desde el ID real del SVG." />
      <InfoCard title="Contexto" value={capaActiva} detail={layerDescriptions[capaActiva]} />
    </div>
  );
}

function getLightAreaGroups(lightAreaIds: string[]) {
  const groups: LightAreaGroup[] = [];
  const plantaBajaEsteGroupedIds = lightAreaIds.filter((id) =>
    /^(sanitarios_(mujeres|hombres|adaptados)|ba.*os_(mujeres|hombres|adaptados)|bedelia|sala_profes)_pb_este$/i.test(
      id,
    ),
  );

  if (plantaBajaEsteGroupedIds.length > 0) {
    groups.push({
      ids: plantaBajaEsteGroupedIds,
      label: "Banos, bedelia y sala profes",
    });
  }

  const entrePisoEsteGroupedIds = lightAreaIds.filter((id) =>
    /^(ba.*os_(mujeres|hombres)|desposito|sala_de_maquinas)_ep_este$/i.test(id),
  );

  if (entrePisoEsteGroupedIds.length > 0) {
    groups.push({
      ids: entrePisoEsteGroupedIds,
      label: "Banos, deposito y sala maquinas",
    });
  }

  const plantaAltaEsteGroupedIds = lightAreaIds.filter(
    (id) => id.endsWith("_pa_este") && !/^(pasillos|puente)_pa_este$/i.test(id),
  );

  if (plantaAltaEsteGroupedIds.length > 0) {
    groups.push({
      ids: plantaAltaEsteGroupedIds,
      label: "Oficinas, banos y aulas",
    });
  }

  lightAreaIds.forEach((id) => {
    if (
      plantaBajaEsteGroupedIds.includes(id) ||
      entrePisoEsteGroupedIds.includes(id) ||
      plantaAltaEsteGroupedIds.includes(id)
    ) {
      return;
    }

    groups.push({
      ids: [id],
      label: formatSvgElementLabel(id),
    });
  });

  return groups;
}

function InfoCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
      <p className="text-sm font-medium text-[#6a88a5]">{title}</p>
      <p className="mt-2 text-2xl font-semibold capitalize text-[#173863]">{value}</p>
      <p className="mt-1 text-sm text-[#6f88a0]">{detail}</p>
    </div>
  );
}
