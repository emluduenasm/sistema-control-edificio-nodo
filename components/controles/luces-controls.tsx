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
    <div className="rounded-lg border border-nodo-line bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}
