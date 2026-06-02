import Link from "next/link";

const accesos = [
  { href: "/interior", label: "Interior", description: "Planos por ala, planta y capa activa." },
  { href: "/exterior", label: "Exterior", description: "Vista preparada para perimetro y servicios externos." },
  { href: "/metricas", label: "Metricas", description: "Panel inicial para consumos, ambiente y conectividad." },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nodo-accent">
          Edificio NODO TECNOLOGICO
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-nodo-ink">
          Control operativo del edificio
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Base inicial para visualizar plantas, controlar servicios por capa y revisar metricas
          operativas con datos simulados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {accesos.map((acceso) => (
          <Link
            key={acceso.href}
            href={acceso.href}
            className="rounded-lg border border-nodo-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-nodo-accent"
          >
            <h2 className="text-lg font-semibold">{acceso.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{acceso.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
