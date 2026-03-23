import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "hooplog_plans";

export interface PlanItem {
  id: string;
  text: string;
  done: boolean;
}

export interface DayPlan {
  date: string;
  items: PlanItem[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface PlansContextValue {
  plans: DayPlan[];
  loading: boolean;
  getPlan: (date: string) => DayPlan | undefined;
  plannedDates: Set<string>;
  addItem: (date: string, text: string) => Promise<void>;
  addItems: (date: string, texts: string[]) => Promise<void>;
  updateItem: (date: string, itemId: string, text: string) => Promise<void>;
  deleteItem: (date: string, itemId: string) => Promise<void>;
  toggleItem: (date: string, itemId: string) => Promise<void>;
  getUpcomingPlans: (fromDate: string, maxDays: number) => DayPlan[];
}

const PlansContext = createContext<PlansContextValue | null>(null);

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setPlans(parsed);
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: DayPlan[]) => {
    setPlans(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const getPlan = useCallback(
    (date: string) => plans.find((p) => p.date === date),
    [plans]
  );

  const plannedDates = useMemo(() => {
    return new Set(plans.filter((p) => p.items.length > 0).map((p) => p.date));
  }, [plans]);

  const addItem = useCallback(
    async (date: string, text: string) => {
      const item: PlanItem = { id: generateId(), text: text.trim(), done: false };
      const exists = plans.some((p) => p.date === date);
      const next = exists
        ? plans.map((p) =>
            p.date === date ? { ...p, items: [...p.items, item] } : p
          )
        : [...plans, { date, items: [item] }];
      await persist(next);
    },
    [plans, persist]
  );

  const addItems = useCallback(
    async (date: string, texts: string[]) => {
      const newItems: PlanItem[] = texts.map((text) => ({
        id: generateId(),
        text: text.trim(),
        done: false,
      }));
      const exists = plans.some((p) => p.date === date);
      const next = exists
        ? plans.map((p) =>
            p.date === date ? { ...p, items: [...p.items, ...newItems] } : p
          )
        : [...plans, { date, items: newItems }];
      await persist(next);
    },
    [plans, persist]
  );

  const updateItem = useCallback(
    async (date: string, itemId: string, text: string) => {
      const next = plans.map((p) =>
        p.date === date
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId ? { ...i, text: text.trim() } : i
              ),
            }
          : p
      );
      await persist(next);
    },
    [plans, persist]
  );

  const deleteItem = useCallback(
    async (date: string, itemId: string) => {
      const next = plans
        .map((p) =>
          p.date === date
            ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
            : p
        )
        .filter((p) => p.items.length > 0);
      await persist(next);
    },
    [plans, persist]
  );

  const toggleItem = useCallback(
    async (date: string, itemId: string) => {
      const next = plans.map((p) =>
        p.date === date
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId ? { ...i, done: !i.done } : i
              ),
            }
          : p
      );
      await persist(next);
    },
    [plans, persist]
  );

  const getUpcomingPlans = useCallback(
    (fromDate: string, maxDays: number): DayPlan[] => {
      return plans
        .filter((p) => p.date > fromDate && p.items.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, maxDays);
    },
    [plans]
  );

  return (
    <PlansContext.Provider
      value={{
        plans,
        loading,
        getPlan,
        plannedDates,
        addItem,
        addItems,
        updateItem,
        deleteItem,
        toggleItem,
        getUpcomingPlans,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error("usePlans must be used within PlansProvider");
  return ctx;
}
