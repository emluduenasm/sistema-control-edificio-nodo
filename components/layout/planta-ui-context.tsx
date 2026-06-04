"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type PlantaUiContextValue = {
  currentPlantKey: string | null;
  currentInteractiveIds: string[];
  lightAreaIds: string[];
  lightStates: Record<string, boolean>;
  setCurrentInteractiveIds: (plantKey: string, ids: string[]) => void;
  setCurrentPlantLightAreas: (plantKey: string, areaIds: string[]) => void;
  setCurrentPlantLightStates: (
    updater:
      | Record<string, boolean>
      | ((current: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
};

const PlantaUiContext = createContext<PlantaUiContextValue | null>(null);

export function PlantaUiProvider({ children }: { children: React.ReactNode }) {
  const [currentPlantKey, setCurrentPlantKey] = useState<string | null>(null);
  const [currentInteractiveIds, setCurrentInteractiveIdsState] = useState<string[]>([]);
  const [lightAreaIds, setLightAreaIds] = useState<string[]>([]);
  const [lightStates, setLightStates] = useState<Record<string, boolean>>({});

  const setCurrentInteractiveIds = useCallback((plantKey: string, ids: string[]) => {
    setCurrentPlantKey(plantKey);
    setCurrentInteractiveIdsState(ids);
  }, []);

  const setCurrentPlantLightAreas = useCallback((plantKey: string, areaIds: string[]) => {
    setCurrentPlantKey(plantKey);
    setLightAreaIds(areaIds);
    setLightStates((current) =>
      Object.fromEntries(areaIds.map((id) => [id, current[id] ?? true])) as Record<string, boolean>,
    );
  }, []);

  const setCurrentPlantLightStates = useCallback(
    (
      updater:
        | Record<string, boolean>
        | ((current: Record<string, boolean>) => Record<string, boolean>),
    ) => {
      setLightStates((current) => (typeof updater === "function" ? updater(current) : updater));
    },
    [],
  );

  const value = useMemo<PlantaUiContextValue>(
    () => ({
      currentPlantKey,
      currentInteractiveIds,
      lightAreaIds,
      lightStates,
      setCurrentInteractiveIds,
      setCurrentPlantLightAreas,
      setCurrentPlantLightStates,
    }),
    [
      currentInteractiveIds,
      currentPlantKey,
      lightAreaIds,
      lightStates,
      setCurrentInteractiveIds,
      setCurrentPlantLightAreas,
      setCurrentPlantLightStates,
    ],
  );

  return <PlantaUiContext.Provider value={value}>{children}</PlantaUiContext.Provider>;
}

export function usePlantaUi() {
  const context = useContext(PlantaUiContext);
  if (!context) {
    throw new Error("usePlantaUi must be used within PlantaUiProvider");
  }

  return context;
}
