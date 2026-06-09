export function AireControls() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full rounded-[24px] border border-dashed border-border bg-white p-6 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">Aire</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#173863]">Capa de aire reservada</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#6986a1]">
          Vamos a mantener esta capa visible en la navegacion, pero por ahora no la vamos a
          implementar en el panel inferior.
        </p>
      </div>
    </div>
  );
}
