import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "../contexts/SettingsContext";
import { Colors, Fonts, FontSizes, Spacing, Radius } from "../constants/theme";
import type { ThemeColors } from "../constants/theme";
import { t } from "../constants/i18n";

const GOAL_OPTIONS = [3, 4, 5, 6, 7];
const HOUR_OPTIONS = [6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22];

export default function OnboardingScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === "dark" ? "dark" : "light"];
  const { update } = useSettings();

  const [step, setStep] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(19);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    await update({ weeklyGoal, reminderEnabled, reminderHour });
    if (reminderEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: { title: "HoopLog", body: t.notifBody },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: reminderHour,
            minute: 0,
          },
        });
      }
    }
    await AsyncStorage.setItem("onboarding_done", "1");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)/");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i <= step ? c.accent : c.barBackground },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && <StepWelcome c={c} />}
        {step === 1 && <StepFeatures c={c} />}
        {step === 2 && (
          <StepSetup
            c={c}
            weeklyGoal={weeklyGoal}
            setWeeklyGoal={setWeeklyGoal}
            reminderEnabled={reminderEnabled}
            setReminderEnabled={setReminderEnabled}
            reminderHour={reminderHour}
            setReminderHour={setReminderHour}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step < 2 ? (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { fontFamily: Fonts.semiBold }]}>
              {t.nextStep}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleFinish}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { fontFamily: Fonts.semiBold }]}>
              {t.startTraining}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function StepWelcome({ c }: { c: ThemeColors }) {
  return (
    <View style={styles.stepContainer}>
      <View style={[styles.iconCircle, { backgroundColor: c.surface }]}>
        <Ionicons name="basketball" size={80} color={c.accent} />
      </View>
      <Text style={[styles.bigTitle, { color: c.text, fontFamily: Fonts.bold }]}>
        Hoop<Text style={{ color: c.accent }}>Log</Text>
      </Text>
      <Text
        style={[styles.tagline, { color: c.textSecondary, fontFamily: Fonts.medium }]}
      >
        {t.tagline}
      </Text>
      <Text style={[styles.desc, { color: c.textSecondary, fontFamily: Fonts.regular }]}>
        {t.welcomeDesc}
      </Text>
    </View>
  );
}

function StepFeatures({ c }: { c: ThemeColors }) {
  const features = [
    {
      icon: "flame" as const,
      title: t.featureStreak,
      desc: t.featureStreakDesc,
    },
    {
      icon: "calendar" as const,
      title: t.featureCalendar,
      desc: t.featureCalendarDesc,
    },
    {
      icon: "document-text" as const,
      title: t.featureNotes,
      desc: t.featureNotesDesc,
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: c.text, fontFamily: Fonts.bold }]}>
        {t.featuresTitle}
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: c.textSecondary, fontFamily: Fonts.regular }]}
      >
        {t.featuresSubtitle}
      </Text>
      {features.map((f) => (
        <View key={f.title} style={[styles.featureCard, { backgroundColor: c.surface }]}>
          <View style={[styles.featureIconBox, { backgroundColor: c.background }]}>
            <Ionicons name={f.icon} size={28} color={c.accent} />
          </View>
          <View style={styles.featureText}>
            <Text
              style={[styles.featureTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
            >
              {f.title}
            </Text>
            <Text
              style={[styles.featureDesc, { color: c.textSecondary, fontFamily: Fonts.regular }]}
            >
              {f.desc}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function StepSetup({
  c,
  weeklyGoal,
  setWeeklyGoal,
  reminderEnabled,
  setReminderEnabled,
  reminderHour,
  setReminderHour,
}: {
  c: ThemeColors;
  weeklyGoal: number;
  setWeeklyGoal: (g: number) => void;
  reminderEnabled: boolean;
  setReminderEnabled: (v: boolean) => void;
  reminderHour: number;
  setReminderHour: (h: number) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: c.text, fontFamily: Fonts.bold }]}>
        {t.setupTitle}
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: c.textSecondary, fontFamily: Fonts.regular }]}
      >
        {t.setupSubtitle}
      </Text>

      <View style={[styles.setupCard, { backgroundColor: c.surface }]}>
        <Text
          style={[styles.setupCardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
        >
          {t.weeklyGoal}
        </Text>
        <View style={styles.goalRow}>
          {GOAL_OPTIONS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setWeeklyGoal(g)}
              style={[
                styles.goalBtn,
                {
                  backgroundColor: weeklyGoal === g ? c.accent : c.background,
                  borderColor: c.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.goalBtnText,
                  {
                    color: weeklyGoal === g ? "#FFFFFF" : c.text,
                    fontFamily: Fonts.medium,
                  },
                ]}
              >
                {t.goalDays(g)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.setupCard, { backgroundColor: c.surface }]}>
        <View style={styles.switchRow}>
          <View>
            <Text
              style={[styles.setupCardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
            >
              {t.setupReminder}
            </Text>
            <Text
              style={[styles.switchDesc, { color: c.textSecondary, fontFamily: Fonts.regular }]}
            >
              {t.setupReminderDesc}
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: c.barBackground, true: c.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
        {reminderEnabled && (
          <View style={styles.hourSection}>
            <Text
              style={[styles.hourLabel, { color: c.textSecondary, fontFamily: Fonts.regular }]}
            >
              {t.reminderTime}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourScroll}
            >
              {HOUR_OPTIONS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setReminderHour(h)}
                  style={[
                    styles.hourBtn,
                    {
                      backgroundColor: reminderHour === h ? c.accent : c.background,
                      borderColor: c.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.hourBtnText,
                      {
                        color: reminderHour === h ? "#FFFFFF" : c.text,
                        fontFamily: Fonts.medium,
                      },
                    ]}
                  >
                    {String(h).padStart(2, "0")}:00
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },

  content: { flexGrow: 1, padding: Spacing.lg },

  stepContainer: { flex: 1, paddingTop: Spacing.xl },

  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  bigTitle: { fontSize: 48, textAlign: "center", marginBottom: Spacing.sm },
  tagline: {
    fontSize: FontSizes.lg,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  desc: { fontSize: FontSizes.md, textAlign: "center", lineHeight: 26 },

  stepTitle: { fontSize: FontSizes.xxl, marginBottom: Spacing.sm },
  stepSubtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  featureIconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: FontSizes.md, marginBottom: 4 },
  featureDesc: { fontSize: FontSizes.sm, lineHeight: 20 },

  setupCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  setupCardTitle: { fontSize: FontSizes.md, marginBottom: Spacing.sm },
  goalRow: { flexDirection: "row", gap: Spacing.sm },
  goalBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  goalBtnText: { fontSize: FontSizes.sm },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchDesc: { fontSize: FontSizes.sm, marginTop: 2 },

  hourSection: { marginTop: Spacing.md },
  hourLabel: { fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  hourScroll: { gap: Spacing.sm },
  hourBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  hourBtnText: { fontSize: FontSizes.sm },

  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  btn: {
    paddingVertical: Spacing.md + 4,
    borderRadius: Radius.xl,
    alignItems: "center",
  },
  btnText: { color: "#FFFFFF", fontSize: FontSizes.md },
});
