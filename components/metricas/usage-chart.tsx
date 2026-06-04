const points = [36, 48, 42, 54, 51, 63, 58];

export function UsageChart() {
  return (
    <div className="rounded-[22px] border border-border bg-white p-5 shadow-panel">
      <h2 className="font-semibold text-[#173863]">Uso electrico simulado</h2>
      <div className="mt-5 flex h-48 items-end gap-3">
        {points.map((point, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[12px] bg-gradient-to-t from-[#42b8ff] to-[#91dcff]"
              style={{ height: `${point * 2}px` }}
            />
            <span className="text-xs text-[#7b91aa]">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
