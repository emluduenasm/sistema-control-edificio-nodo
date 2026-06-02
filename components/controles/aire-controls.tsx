export function AireControls() {
  return (
    <div className="grid h-full grid-cols-3 gap-4">
      <ControlCard title="Equipos encendidos" value="9/12" detail="Setpoint promedio 24 C" />
      <ControlCard title="Alertas termicas" value="2" detail="Aulas flexibles y servicios" />
      <ControlCard title="Modo" value="Confort" detail="Ajuste por ocupacion" />
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
