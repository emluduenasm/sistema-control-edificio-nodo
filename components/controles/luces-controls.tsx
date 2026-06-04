export function LucesControls() {
  return (
    <div className="grid h-full grid-cols-3 gap-4">
      <ControlCard title="Circuitos activos" value="18/21" detail="3 zonas en revision" />
      <ControlCard title="Consumo estimado" value="42 kWh" detail="Turno actual" />
      <ControlCard title="Modo" value="Automatico" detail="Escenas por ocupacion" />
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
