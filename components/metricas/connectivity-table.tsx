import { computadorasMock } from "@/lib/mock/computadoras.mock";

export function ConnectivityTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-nodo-line bg-white shadow-sm">
      <div className="border-b border-nodo-line p-4">
        <h2 className="font-semibold">Conectividad</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Equipo</th>
            <th className="px-4 py-3 font-medium">Ubicacion</th>
            <th className="px-4 py-3 font-medium">IP</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Ping</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-nodo-line">
          {computadorasMock.map((computadora) => (
            <tr key={computadora.id}>
              <td className="px-4 py-3 font-medium">{computadora.nombre}</td>
              <td className="px-4 py-3 capitalize">
                Ala {computadora.ala} · {computadora.planta.replaceAll("-", " ")}
              </td>
              <td className="px-4 py-3">{computadora.ip}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    computadora.conectada
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
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
