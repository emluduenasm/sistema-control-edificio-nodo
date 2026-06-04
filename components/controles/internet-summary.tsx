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
    <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
      <p className="text-sm font-medium text-[#6a88a5]">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[#173863]">{value}</p>
    </div>
  );
}
