import { BottomPanel } from "@/components/layout/bottom-panel";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid h-screen grid-rows-[72px_1fr_180px] overflow-hidden bg-nodo-bg">
      <TopBar />
      <main className="min-h-0 overflow-hidden">{children}</main>
      <BottomPanel />
    </div>
  );
}
