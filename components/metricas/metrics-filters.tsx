export function MetricsFilters() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-nodo-line bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nodo-accent">
          Metricas
        </p>
        <h1 className="text-2xl font-semibold">Indicadores operativos</h1>
      </div>
      <div className="flex gap-2">
        {["Hoy", "7 dias", "30 dias"].map((label, index) => (
          <button
            key={label}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              index === 0 ? "bg-nodo-accent text-white" : "bg-slate-100 text-slate-700"
            }`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
