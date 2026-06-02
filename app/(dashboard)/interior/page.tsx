import Link from "next/link";

import { plantasDisponibles } from "@/lib/svg/planta-map";

export default function InteriorPage() {
  return (
    <section className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center gap-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nodo-accent">
          Interior
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Seleccion de planta</h1>
        <p className="mt-2 text-slate-600">
          Accesos iniciales a los planos cargados en public/planos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plantasDisponibles.map(({ ala, planta, path }) => (
          <Link
            key={`${ala}-${planta}`}
            href={`/interior/${ala}/${planta}`}
            className="rounded-lg border border-nodo-line bg-white p-5 shadow-sm transition hover:border-nodo-accent"
          >
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Ala {ala}</p>
            <h2 className="mt-2 text-xl font-semibold">{planta.replaceAll("-", " ")}</h2>
            <p className="mt-2 text-sm text-slate-500">{path}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
