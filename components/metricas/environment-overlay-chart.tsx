const values = [
  { label: "Temp", value: "24 C" },
  { label: "Humedad", value: "48%" },
  { label: "Ocupacion", value: "102" },
];

export function EnvironmentOverlayChart() {
  return (
    <div className="rounded-[22px] border border-border bg-white p-5 shadow-panel">
      <h2 className="font-semibold text-[#173863]">Ambiente</h2>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {values.map((item) => (
          <div key={item.label} className="rounded-[18px] bg-[#f5fbff] p-4 text-center">
            <p className="text-sm text-[#7391aa]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#173863]">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 h-28 rounded-[18px] bg-gradient-to-r from-[#dff7ea] via-[#fff5d8] to-[#ffe3ea]" />
    </div>
  );
}
