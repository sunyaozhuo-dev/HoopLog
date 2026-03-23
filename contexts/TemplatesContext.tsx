import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "hooplog_templates";

export interface PlanTemplate {
  id: string;
  name: string;
  items: string[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface TemplatesContextValue {
  templates: PlanTemplate[];
  loading: boolean;
  saveTemplate: (name: string, items: string[]) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

const TemplatesContext = createContext<TemplatesContextValue | null>(null);

export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setTemplates(parsed);
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: PlanTemplate[]) => {
    setTemplates(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveTemplate = useCallback(
    async (name: string, items: string[]) => {
      const template: PlanTemplate = {
        id: generateId(),
        name: name.trim(),
        items,
      };
      await persist([...templates, template]);
    },
    [templates, persist]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await persist(templates.filter((t) => t.id !== id));
    },
    [templates, persist]
  );

  return (
    <TemplatesContext.Provider
      value={{ templates, loading, saveTemplate, deleteTemplate }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}

export function useTemplates() {
  const ctx = useContext(TemplatesContext);
  if (!ctx) throw new Error("useTemplates must be used within TemplatesProvider");
  return ctx;
}
