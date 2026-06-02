import { computadorasMock } from "@/lib/mock/computadoras.mock";

export function InternetSummary() {
  const conectadas = computadorasMock.filter((computadora) => computadora.conectada).length;

  return (
    <div className="grid h-full grid-cols-3 gap-4">
      <SummaryCard title="Computadoras online" value={`${conectadas}/${computadorasMock.length}`} />
      <SummaryCard title="Ping promedio" value="15 ms" />
      <SummaryCard title="Incidentes" value="1 enlace caido" />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-nodo-line bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
