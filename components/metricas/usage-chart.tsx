const points = [36, 48, 42, 54, 51, 63, 58];

export function UsageChart() {
  return (
    <div className="rounded-lg border border-nodo-line bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Uso electrico simulado</h2>
      <div className="mt-5 flex h-48 items-end gap-3">
        {points.map((point, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-nodo-accent"
              style={{ height: `${point * 2}px` }}
            />
            <span className="text-xs text-slate-500">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
