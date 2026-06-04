export default function ExteriorPage() {
  return (
    <section className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-4xl rounded-[24px] border border-dashed border-border bg-white p-8 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">
          Exterior
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#173863]">Vista exterior del NODO</h1>
        <p className="mx-auto mt-3 max-w-2xl text-[#6986a1]">
          Espacio reservado para integrar accesos, bombas, perimetro, tableros externos y estados
          generales del edificio.
        </p>
      </div>
    </section>
  );
}
