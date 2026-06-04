import { Suspense } from "react";

import { BottomPanel } from "@/components/layout/bottom-panel";
import { PlantaUiProvider } from "@/components/layout/planta-ui-context";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PlantaUiProvider>
      <div className="grid h-screen grid-rows-[72px_1fr_240px] overflow-hidden bg-nodo-bg">
        <TopBar />
        <main className="min-h-0 overflow-hidden bg-[linear-gradient(180deg,rgba(221,247,255,0.72),rgba(238,251,255,0.96))]">
          {children}
        </main>
        <Suspense fallback={<div className="border-t border-border/90 bg-card px-6 py-4" />}>
          <BottomPanel />
        </Suspense>
      </div>
    </PlantaUiProvider>
  );
}
