import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToday, calcStreak } from "../utils/dateHelpers";

const STORAGE_KEY = "hooplog_logs";

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface DayLog {
  date: string;
  notes: Note[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function migrate(raw: unknown): DayLog[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any) => {
    if (Array.isArray(item.notes)) return item as DayLog;
    const notes: Note[] =
      item.note && item.note.trim()
        ? [{ id: generateId(), text: item.note, createdAt: item.date + "T00:00:00" }]
        : [];
    return { date: item.date, notes };
  });
}

interface LogsContextValue {
  logs: DayLog[];
  loading: boolean;
  isTodayLogged: boolean;
  streak: number;
  loggedDates: Set<string>;
  recentLogs: DayLog[];
  totalDays: number;
  longestStreak: number;
  weeklyCount: number;
  checkIn: () => Promise<void>;
  addNote: (date: string, text: string) => Promise<void>;
  deleteNote: (date: string, noteId: string) => Promise<void>;
  deleteDay: (date: string) => Promise<void>;
  getLog: (date: string) => DayLog | undefined;
}

const LogsContext = createContext<LogsContextValue | null>(null);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setLogs(migrate(JSON.parse(raw)));
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: DayLog[]) => {
    setLogs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const today = getToday();
  const isTodayLogged = useMemo(() => logs.some((l) => l.date === today), [logs, today]);

  const checkIn = useCallback(async () => {
    if (logs.some((l) => l.date === today)) return;
    await persist([...logs, { date: today, notes: [] }]);
  }, [logs, today, persist]);

  const addNote = useCallback(
    async (date: string, text: string) => {
      const note: Note = {
        id: generateId(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const exists = logs.some((l) => l.date === date);
      const next = exists
        ? logs.map((l) => (l.date === date ? { ...l, notes: [...l.notes, note] } : l))
        : [...logs, { date, notes: [note] }];
      await persist(next);
    },
    [logs, persist]
  );

  const deleteNote = useCallback(
    async (date: string, noteId: string) => {
      const next = logs.map((l) =>
        l.date === date ? { ...l, notes: l.notes.filter((n) => n.id !== noteId) } : l
      );
      await persist(next);
    },
    [logs, persist]
  );

  const deleteDay = useCallback(
    async (date: string) => {
      await persist(logs.filter((l) => l.date !== date));
    },
    [logs, persist]
  );

  const streak = useMemo(() => calcStreak(logs.map((l) => l.date)), [logs]);

  const getLog = useCallback(
    (date: string) => logs.find((l) => l.date === date),
    [logs]
  );

  const loggedDates = useMemo(() => new Set(logs.map((l) => l.date)), [logs]);

  const recentLogs = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const cutoff =
      sevenDaysAgo.getFullYear() +
      "-" +
      String(sevenDaysAgo.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(sevenDaysAgo.getDate()).padStart(2, "0");
    return [...logs]
      .filter((l) => l.date >= cutoff && l.notes.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  const totalDays = logs.length;

  const longestStreak = useMemo(() => {
    if (logs.length === 0) return 0;
    const sorted = logs.map((l) => l.date).sort();
    let max = 1;
    let cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const next = new Date(sorted[i]);
      const diff = (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        cur++;
        max = Math.max(max, cur);
      } else {
        cur = 1;
      }
    }
    return max;
  }, [logs]);

  const weeklyCount = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(monday.getDate() + mondayOffset);
    const mondayStr =
      monday.getFullYear() +
      "-" +
      String(monday.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(monday.getDate()).padStart(2, "0");
    return logs.filter((l) => l.date >= mondayStr && l.date <= today).length;
  }, [logs, today]);

  return (
    <LogsContext.Provider
      value={{
        logs,
        loading,
        isTodayLogged,
        streak,
        loggedDates,
        recentLogs,
        totalDays,
        longestStreak,
        weeklyCount,
        checkIn,
        addNote,
        deleteNote,
        deleteDay,
        getLog,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error("useLogs must be used within LogsProvider");
  return ctx;
}
