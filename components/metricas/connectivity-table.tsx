import { computadorasMock } from "@/lib/mock/computadoras.mock";

export function ConnectivityTable() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border bg-white shadow-panel">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold text-[#173863]">Conectividad</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f5fbff] text-[#7091aa]">
          <tr>
            <th className="px-4 py-3 font-medium">Equipo</th>
            <th className="px-4 py-3 font-medium">Ubicacion</th>
            <th className="px-4 py-3 font-medium">IP</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Ping</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {computadorasMock.map((computadora) => (
            <tr key={computadora.id} className="text-[#5d7d99]">
              <td className="px-4 py-3 font-medium text-[#173863]">{computadora.nombre}</td>
              <td className="px-4 py-3 capitalize">
                Ala {computadora.ala} - {computadora.planta.replaceAll("-", " ")}
              </td>
              <td className="px-4 py-3">{computadora.ip}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    computadora.conectada
                      ? "bg-[#dff7ea] text-[#1b8d5d]"
                      : "bg-[#ffe3ea] text-[#d64d6e]"
                  }`}
                >
                  {computadora.conectada ? "online" : "offline"}
                </span>
              </td>
              <td className="px-4 py-3">
                {computadora.conectada ? `${computadora.ultimoPingMs} ms` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
