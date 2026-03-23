import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLogs } from "../../contexts/LogsContext";
import { usePlans } from "../../contexts/PlansContext";
import { useTemplates } from "../../contexts/TemplatesContext";
import { SwipeableNoteItem } from "../../components/SwipeableNoteItem";
import { PlanCard } from "../../components/PlanCard";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  getToday,
} from "../../utils/dateHelpers";
import { Colors, Fonts, FontSizes, Spacing, Radius } from "../../constants/theme";
import { t } from "../../constants/i18n";

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === "dark" ? "dark" : "light"];
  const { logs, loggedDates, getLog, deleteNote } = useLogs();
  const { getPlan, plannedDates, addItem, addItems, updateItem, deleteItem, toggleItem } = usePlans();
  const { templates, saveTemplate, deleteTemplate } = useTemplates();
  const [selectedDate, setSelectedDate] = useState<string>(getToday());

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Handle deep link from home screen upcoming plans
  const { date: linkedDate } = useLocalSearchParams<{ date?: string }>();

  useEffect(() => {
    if (linkedDate) {
      setSelectedDate(linkedDate);
      // Navigate calendar to the linked date's month
      const parts = linkedDate.split("-");
      if (parts.length === 3) {
        setYear(parseInt(parts[0], 10));
        setMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [linkedDate]);

  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = getToday();

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthCount = days.filter((d) => loggedDates.has(d)).length;

  // 本月有笔记的日志
  const monthNotes = days
    .filter((d) => {
      const log = getLog(d);
      return log && log.notes.length > 0;
    })
    .reverse()
    .map((d) => ({ date: d, log: getLog(d)! }));

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: c.text, fontFamily: Fonts.bold }]}>
            {t.calendarTitle}
          </Text>

          {/* 月历 */}
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <View style={styles.monthNav}>
              <Pressable onPress={prevMonth} hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color={c.text} />
              </Pressable>
              <Text
                style={[
                  styles.monthTitle,
                  { color: c.text, fontFamily: Fonts.semiBold },
                ]}
              >
                {t.monthTitle(year, getMonthName(month))}
              </Text>
              <Pressable onPress={nextMonth} hitSlop={12}>
                <Ionicons name="chevron-forward" size={22} color={c.text} />
              </Pressable>
            </View>

            <Text
              style={[
                styles.monthCount,
                { color: c.textSecondary, fontFamily: Fonts.regular },
              ]}
            >
              {t.monthTraining(monthCount)}
            </Text>

            <View style={styles.weekRow}>
              {t.weekDays.map((d) => (
                <Text
                  key={d}
                  style={[
                    styles.weekLabel,
                    { color: c.textSecondary, fontFamily: Fonts.medium },
                  ]}
                >
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              {days.map((dateStr) => {
                const dayNum = parseInt(dateStr.split("-")[2], 10);
                const logged = loggedDates.has(dateStr);
                const planned = plannedDates.has(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <Pressable
                    key={dateStr}
                    style={styles.dayCell}
                    onPress={() => setSelectedDate(dateStr)}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        logged && { backgroundColor: c.accent },
                        !logged &&
                          planned && {
                            borderWidth: 2,
                            borderColor: c.accent,
                            borderStyle: "dashed" as any,
                          },
                        isToday &&
                          !logged &&
                          !planned && {
                            borderWidth: 2,
                            borderColor: c.accent,
                          },
                        isSelected && !logged && { backgroundColor: c.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: logged
                              ? "#FFFFFF"
                              : isToday || planned
                                ? c.accent
                                : c.text,
                            fontFamily:
                              isToday || isSelected ? Fonts.bold : Fonts.regular,
                          },
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {loggedDates.size === 0 && (
              <Text
                style={[
                  styles.emptyHint,
                  { color: c.textSecondary, fontFamily: Fonts.regular },
                ]}
              >
                {t.calendarEmpty}
              </Text>
            )}
          </View>

          {/* 选中日期的计划和笔记 */}
          {(() => {
            const selPlan = getPlan(selectedDate);
            const selLog = getLog(selectedDate);
            const hasContent = (selPlan && selPlan.items.length > 0) || (selLog && selLog.notes.length > 0);
            const isLogged = loggedDates.has(selectedDate);

            return (
              <View style={[styles.card, { backgroundColor: c.surface }]}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: c.text, fontFamily: Fonts.semiBold },
                  ]}
                >
                  {selectedDate === todayStr ? t.today : selectedDate}
                </Text>

                <PlanCard
                  items={selPlan?.items ?? []}
                  date={selectedDate}
                  colors={c}
                  canToggle={isLogged || selectedDate === todayStr}
                  onAdd={(text) => addItem(selectedDate, text)}
                  onToggle={(itemId) => toggleItem(selectedDate, itemId)}
                  onUpdate={(itemId, text) => updateItem(selectedDate, itemId, text)}
                  onDelete={(itemId) => deleteItem(selectedDate, itemId)}
                  templates={templates}
                  onSaveAsTemplate={(name, items) => saveTemplate(name, items)}
                  onApplyTemplate={(items) => addItems(selectedDate, items)}
                  onDeleteTemplate={(id) => deleteTemplate(id)}
                />

                {selLog && selLog.notes.length > 0 && (
                  <View>
                    <Text
                      style={[
                        styles.noteDateHeader,
                        { color: c.textSecondary, fontFamily: Fonts.medium },
                      ]}
                    >
                      {t.notes}
                    </Text>
                    {selLog.notes.map((note) => (
                      <SwipeableNoteItem
                        key={note.id}
                        text={note.text}
                        time={note.createdAt.split("T")[1]?.slice(0, 5)}
                        colors={c}
                        onDelete={() => deleteNote(selectedDate, note.id)}
                      />
                    ))}
                  </View>
                )}

                {!hasContent && (
                  <Text
                    style={[
                      styles.emptyHint,
                      { color: c.textSecondary, fontFamily: Fonts.regular },
                    ]}
                  >
                    {t.planEmpty}
                  </Text>
                )}
              </View>
            );
          })()}

          {/* 本月笔记 */}
          {monthNotes.length > 0 && (
            <View style={[styles.card, { backgroundColor: c.surface }]}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: c.text, fontFamily: Fonts.semiBold },
                ]}
              >
                {t.monthNotes}
              </Text>
              {monthNotes.map(({ date, log }) => (
                <View key={date}>
                  <Text
                    style={[
                      styles.noteDateHeader,
                      { color: c.textSecondary, fontFamily: Fonts.medium },
                    ]}
                  >
                    {date}
                  </Text>
                  {log.notes.map((note) => (
                    <SwipeableNoteItem
                      key={note.id}
                      text={note.text}
                      time={note.createdAt.split("T")[1]?.slice(0, 5)}
                      colors={c}
                      onDelete={() => deleteNote(date, note.id)}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  title: { fontSize: FontSizes.xxl, marginBottom: Spacing.lg },

  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSizes.md, marginBottom: Spacing.md },

  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  monthTitle: { fontSize: FontSizes.lg },
  monthCount: { fontSize: FontSizes.sm, marginBottom: Spacing.md },

  weekRow: { flexDirection: "row", marginBottom: Spacing.xs },
  weekLabel: { flex: 1, textAlign: "center", fontSize: FontSizes.xs },

  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: FontSizes.sm },

  noteDateHeader: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: 20,
  },
});
