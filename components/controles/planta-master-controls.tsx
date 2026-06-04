import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapaActiva } from "@/types/building";

type PlantaMasterControlsProps = {
  capaActiva: CapaActiva;
  selectedId?: string | null;
  onTurnAllOn?: () => void;
  onTurnAllOff?: () => void;
};

export function PlantaMasterControls({
  capaActiva,
  selectedId,
  onTurnAllOn,
  onTurnAllOff,
}: PlantaMasterControlsProps) {
  return (
    <Card className="bg-[#f9fdff]">
      <CardHeader className="pb-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6b8ca9]">
          Control general
        </p>
        <CardTitle className="text-xl capitalize text-[#173863]">{capaActiva}</CardTitle>
      </CardHeader>
      <CardContent>
        {capaActiva === "luces" ? (
          <div className="space-y-3">
            <div className="grid gap-2">
              <ActionButton label="Prender todo" tone="on" onClick={onTurnAllOn} />
              <ActionButton label="Apagar todo" tone="off" onClick={onTurnAllOff} />
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-[#6583a0]">
            {selectedId
              ? "El sector activo del SVG ya esta enlazado con este contexto operativo."
              : "Selecciona un sector real del plano para habilitar acciones detalladas abajo."}
          </p>
        )}
        {selectedId ? (
          <p className="mt-3 break-all text-xs text-[#7b93ab]">{selectedId}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActionButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "on" | "off";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        tone === "on"
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-rose-100 text-rose-700 hover:bg-rose-200"
      }`}
    >
      {label}
    </button>
  );
}
