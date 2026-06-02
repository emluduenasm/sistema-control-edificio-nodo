export default function ExteriorPage() {
  return (
    <section className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-4xl rounded-lg border border-dashed border-nodo-line bg-white p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nodo-accent">
          Exterior
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Vista exterior del NODO</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Espacio reservado para integrar accesos, bombas, perimetro, tableros externos y estados
          generales del edificio.
        </p>
      </div>
    </section>
  );
}
