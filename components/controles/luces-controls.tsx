export type LightControlGroup = {
  ids: string[];
  key: string;
  label: string;
  detail: string;
};

type LucesControlsProps = {
  groups?: LightControlGroup[];
  lightStates?: Record<string, boolean>;
  onToggleGroup?: (ids: string[]) => void;
};

export function LucesControls({
  groups = [],
  lightStates = {},
  onToggleGroup,
}: LucesControlsProps) {
  if (groups.length === 0) {
    return (
      <div className="grid h-full grid-cols-3 gap-4">
        <ControlCard title="Circuitos activos" value="18/21" detail="3 zonas en revision" />
        <ControlCard title="Consumo estimado" value="42 kWh" detail="Turno actual" />
        <ControlCard title="Modo" value="Automatico" detail="Escenas por ocupacion" />
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-3 gap-4">
      {groups.map((group) => {
        const isOn = group.ids.every((id) => lightStates[id] ?? true);
        const onCount = group.ids.filter((id) => lightStates[id] ?? true).length;
        const offCount = group.ids.length - onCount;

        return (
          <div
            key={group.key}
            className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#6a88a5]">{group.label}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-semibold text-[#173863]">{group.ids.length} areas</p>
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {onCount} encendidas
                  </span>
                  <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700">
                    {offCount} apagadas
                  </span>
                </div>
                {group.detail ? <p className="mt-1 text-sm text-[#6f88a0]">{group.detail}</p> : null}
              </div>
              <button
                type="button"
                aria-pressed={isOn}
                onClick={() => onToggleGroup?.(group.ids)}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition ${
                  isOn
                    ? "border-emerald-300 bg-emerald-500"
                    : "border-rose-300 bg-rose-500"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow transition ${
                    isOn ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ControlCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
      <p className="text-sm font-medium text-[#6a88a5]">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[#173863]">{value}</p>
      <p className="mt-1 text-sm text-[#6f88a0]">{detail}</p>
    </div>
  );
}
