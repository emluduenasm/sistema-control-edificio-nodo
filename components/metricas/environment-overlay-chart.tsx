const values = [
  { label: "Temp", value: "24 C" },
  { label: "Humedad", value: "48%" },
  { label: "Ocupacion", value: "102" },
];

export function EnvironmentOverlayChart() {
  return (
    <div className="rounded-lg border border-nodo-line bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Ambiente</h2>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {values.map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 h-28 rounded-lg bg-gradient-to-r from-emerald-100 via-amber-100 to-rose-100" />
    </div>
  );
}
