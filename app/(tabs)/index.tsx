import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  SectionList,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useLogs } from "../../contexts/LogsContext";
import { useSettings } from "../../contexts/SettingsContext";
import { usePlans } from "../../contexts/PlansContext";
import { useTemplates } from "../../contexts/TemplatesContext";
import { WeeklyGoalRing } from "../../components/WeeklyGoalRing";
import { PlanCard } from "../../components/PlanCard";
import { SwipeableNoteItem } from "../../components/SwipeableNoteItem";
import { Colors, Fonts, FontSizes, Spacing, Radius } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { getToday } from "../../utils/dateHelpers";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === "dark" ? "dark" : "light"];
  const {
    loading,
    isTodayLogged,
    streak,
    weeklyCount,
    recentLogs,
    checkIn,
    addNote,
    deleteNote,
  } = useLogs();
  const { settings } = useSettings();
  const { getPlan, addItem, addItems, updateItem, deleteItem, toggleItem, getUpcomingPlans } = usePlans();
  const { templates, saveTemplate, deleteTemplate } = useTemplates();

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");

  const today = getToday();
  const todayPlan = getPlan(today);
  const upcomingPlans = getUpcomingPlans(today, 3);

  const doneCount = todayPlan?.items.filter((i) => i.done).length ?? 0;
  const totalCount = todayPlan?.items.length ?? 0;
  const allPlansDone = totalCount > 0 && doneCount === totalCount;
  const showAllDoneBanner = allPlansDone && !isTodayLogged;

  const handleCheckIn = async () => {
    await checkIn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    await addNote(today, noteText.trim());
    setNoteText("");
    setShowNoteInput(false);
  };

  const sections = recentLogs.map((log) => ({
    title: log.date === today ? t.today : log.date,
    date: log.date,
    data: log.notes,
  }));

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            stickySectionHeadersEnabled={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View>
                {/* 标题 */}
                <Text style={[styles.title, { color: c.text, fontFamily: Fonts.bold }]}>
                  Hoop<Text style={{ color: c.accent }}>Log</Text>
                </Text>

                {/* 顶部卡片行：连续天数 + 周目标环 */}
                <View style={styles.topRow}>
                  <View style={[styles.streakCard, { backgroundColor: c.surface }]}>
                    <Ionicons name="flame" size={28} color={c.accent} />
                    <Text
                      style={[
                        styles.streakNumber,
                        { color: c.text, fontFamily: Fonts.bold },
                      ]}
                    >
                      {streak}
                    </Text>
                    <Text
                      style={[
                        styles.streakLabel,
                        { color: c.textSecondary, fontFamily: Fonts.regular },
                      ]}
                    >
                      {t.streakDays}
                    </Text>
                  </View>
                  <View style={[styles.ringCard, { backgroundColor: c.surface }]}>
                    <WeeklyGoalRing
                      current={weeklyCount}
                      goal={settings.weeklyGoal}
                      colors={c}
                    />
                  </View>
                </View>

                {/* 已打卡：打卡状态在上，计划在下 */}
                {isTodayLogged && (
                  <Pressable
                    disabled
                    style={[
                      styles.checkInBtn,
                      { backgroundColor: c.surface },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={40} color={c.accent} />
                    <Text
                      style={[
                        styles.checkInText,
                        { color: c.accent, fontFamily: Fonts.semiBold },
                      ]}
                    >
                      {t.checkedIn}
                    </Text>
                  </Pressable>
                )}

                {/* 训练计划 */}
                {(!isTodayLogged || totalCount > 0) && (
                  <PlanCard
                    items={todayPlan?.items ?? []}
                    date={today}
                    colors={c}
                    canToggle={true}
                    onAdd={(text) => addItem(today, text)}
                    onToggle={(itemId) => toggleItem(today, itemId)}
                    onUpdate={(itemId, text) => updateItem(today, itemId, text)}
                    onDelete={(itemId) => deleteItem(today, itemId)}
                    templates={templates}
                    onSaveAsTemplate={(name, items) => saveTemplate(name, items)}
                    onApplyTemplate={(items) => addItems(today, items)}
                    onDeleteTemplate={(id) => deleteTemplate(id)}
                  />
                )}

                {/* 未打卡：全部完成横幅 */}
                {showAllDoneBanner && (
                  <Pressable
                    onPress={handleCheckIn}
                    style={({ pressed }) => [
                      styles.allDoneBanner,
                      {
                        backgroundColor: c.accent,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="checkmark-done-circle" size={24} color="#FFFFFF" />
                    <Text style={[styles.allDoneText, { fontFamily: Fonts.semiBold }]}>
                      {t.allDoneCheckIn}
                    </Text>
                  </Pressable>
                )}

                {/* 未打卡：打卡按钮在计划下方 */}
                {!isTodayLogged && (
                  <Pressable
                    onPress={handleCheckIn}
                    style={({ pressed }) => [
                      styles.checkInBtn,
                      {
                        backgroundColor: c.accent,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="basketball" size={40} color="#FFFFFF" />
                    <Text
                      style={[
                        styles.checkInText,
                        { color: "#FFFFFF", fontFamily: Fonts.semiBold },
                      ]}
                    >
                      {t.checkIn}
                    </Text>
                    {totalCount > 0 && (
                      <Text
                        style={[
                          styles.planProgress,
                          { color: "rgba(255,255,255,0.8)", fontFamily: Fonts.regular },
                        ]}
                      >
                        {doneCount}/{totalCount} {t.planCompleted}
                      </Text>
                    )}
                  </Pressable>
                )}

                {/* 即将到来的计划 */}
                {upcomingPlans.length > 0 && (
                  <View style={[styles.upcomingCard, { backgroundColor: c.surface }]}>
                    <View style={styles.upcomingHeader}>
                      <Ionicons name="calendar-outline" size={18} color={c.accent} />
                      <Text
                        style={[
                          styles.upcomingTitle,
                          { color: c.text, fontFamily: Fonts.semiBold },
                        ]}
                      >
                        {t.upcoming}
                      </Text>
                    </View>
                    {upcomingPlans.map((plan) => (
                      <Pressable
                        key={plan.date}
                        onPress={() => router.push(`/history?date=${plan.date}`)}
                        style={[styles.upcomingRow, { borderColor: c.border }]}
                      >
                        <View style={styles.upcomingInfo}>
                          <Text
                            style={[
                              styles.upcomingDate,
                              { color: c.text, fontFamily: Fonts.medium },
                            ]}
                          >
                            {plan.date}
                          </Text>
                          <Text
                            style={[
                              styles.upcomingCount,
                              { color: c.textSecondary, fontFamily: Fonts.regular },
                            ]}
                          >
                            {t.upcomingItems(plan.items.length)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* 笔记输入区 */}
                {!showNoteInput && (
                  <Pressable
                    onPress={() => setShowNoteInput(true)}
                    style={[styles.addNoteBtn, { borderColor: c.border }]}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={c.accent} />
                    <Text
                      style={[
                        styles.addNoteText,
                        { color: c.accent, fontFamily: Fonts.medium },
                      ]}
                    >
                      {t.writeNote}
                    </Text>
                  </Pressable>
                )}

                {showNoteInput && (
                  <View style={[styles.noteInputCard, { backgroundColor: c.surface }]}>
                    <TextInput
                      style={[
                        styles.noteInput,
                        {
                          color: c.text,
                          backgroundColor: c.background,
                          borderColor: c.border,
                          fontFamily: Fonts.regular,
                        },
                      ]}
                      placeholder={t.notePlaceholder}
                      placeholderTextColor={c.inactive}
                      value={noteText}
                      onChangeText={setNoteText}
                      multiline
                      maxLength={200}
                      autoFocus
                    />
                    <View style={styles.noteActions}>
                      <Pressable
                        onPress={() => {
                          setShowNoteInput(false);
                          setNoteText("");
                        }}
                      >
                        <Text
                          style={[
                            styles.cancelText,
                            { color: c.textSecondary, fontFamily: Fonts.medium },
                          ]}
                        >
                          {t.cancel}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={handleSaveNote}
                        style={({ pressed }) => [
                          styles.saveBtn,
                          { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 },
                        ]}
                      >
                        <Text style={[styles.saveBtnText, { fontFamily: Fonts.semiBold }]}>
                          {t.save}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 最近笔记标题 */}
                {sections.length > 0 && (
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: c.text, fontFamily: Fonts.semiBold },
                    ]}
                  >
                    {t.recentNotes}
                  </Text>
                )}
              </View>
            }
            renderSectionHeader={({ section }) => (
              <Text
                style={[
                  styles.dayHeader,
                  { color: c.textSecondary, fontFamily: Fonts.medium },
                ]}
              >
                {section.title}
              </Text>
            )}
            renderItem={({ item, section }) => (
              <SwipeableNoteItem
                text={item.text}
                time={item.createdAt.split("T")[1]?.slice(0, 5)}
                colors={c}
                onDelete={() => deleteNote(section.date, item.id)}
              />
            )}
            ListEmptyComponent={
              <Text
                style={[
                  styles.emptyText,
                  { color: c.textSecondary, fontFamily: Fonts.regular },
                ]}
              >
                {isTodayLogged ? t.emptyCheckedIn : t.emptyNotCheckedIn}
              </Text>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

  title: { fontSize: FontSizes.xxl, marginBottom: Spacing.lg },

  topRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  streakCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: 4,
  },
  streakNumber: { fontSize: FontSizes.xxl },
  streakLabel: { fontSize: FontSizes.sm },
  ringCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },

  checkInBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  checkInText: { fontSize: FontSizes.lg },
  planProgress: { fontSize: FontSizes.sm },

  allDoneBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  allDoneText: { color: "#FFFFFF", fontSize: FontSizes.md },

  upcomingCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  upcomingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  upcomingTitle: { fontSize: FontSizes.md },
  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  upcomingInfo: { flex: 1 },
  upcomingDate: { fontSize: FontSizes.sm },
  upcomingCount: { fontSize: FontSizes.xs, marginTop: 2 },

  addNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
  },
  addNoteText: { fontSize: FontSizes.md },

  noteInputCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    fontSize: FontSizes.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  cancelText: { fontSize: FontSizes.sm },
  saveBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: FontSizes.sm },

  sectionHeader: { fontSize: FontSizes.lg, marginBottom: Spacing.sm },
  dayHeader: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },

  emptyText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontSize: FontSizes.md,
  },
});
