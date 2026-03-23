import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Alert,
  Share,
  useColorScheme,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useLogs } from "../../contexts/LogsContext";
import { useSettings } from "../../contexts/SettingsContext";
import { Colors, Fonts, FontSizes, Spacing, Radius } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { getDaysInMonth, getMonthName } from "../../utils/dateHelpers";
import appJson from "../../app.json";
import type { ThemeColors } from "../../constants/theme";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function scheduleReminder(hour: number, minute: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(t.notifPermTitle, t.notifPermMsg);
    return false;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "HoopLog",
      body: t.notifBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return true;
}

async function cancelReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === "dark" ? "dark" : "light"];
  const { logs, totalDays, longestStreak, streak, loggedDates } = useLogs();
  const { settings, update } = useSettings();

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      await update({ avatarUri: result.assets[0].uri });
    }
  };

  const goalOptions = [3, 4, 5, 6, 7];

  // 最近 6 个月训练趋势
  const today = new Date();
  const monthlyTrend = (() => {
    const trend: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthDays = getDaysInMonth(y, m);
      const count = monthDays.filter((dd) => loggedDates.has(dd)).length;
      trend.push({ label: getMonthName(m), count });
    }
    return trend;
  })();

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  const handleToggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const ok = await scheduleReminder(settings.reminderHour, settings.reminderMinute);
      if (ok) await update({ reminderEnabled: true });
    } else {
      await cancelReminder();
      await update({ reminderEnabled: false });
    }
  };

  const handleChangeHour = async (hour: number) => {
    await update({ reminderHour: hour });
    if (settings.reminderEnabled) {
      await scheduleReminder(hour, settings.reminderMinute);
    }
  };

  const handleExport = async () => {
    const data = logs
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((l) => {
        const notes = l.notes.map((n) => `  - ${n.text}`).join("\n");
        return `${l.date}${notes ? "\n" + notes : ""}`;
      })
      .join("\n\n");

    const text = `${t.exportTitle}\n${t.exportTotalDays}: ${totalDays}\n${t.exportCurrentStreak}: ${t.streakValue(streak)}\n${t.exportLongestStreak}: ${t.streakValue(longestStreak)}\n\n---\n\n${data}`;

    await Share.share({ message: text });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: c.text, fontFamily: Fonts.bold }]}>
          {t.profileTitle}
        </Text>

        {/* 昵称 */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.profileRow}>
            <Pressable onPress={handlePickAvatar}>
              {settings.avatarUri ? (
                <Image
                  source={{ uri: settings.avatarUri }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: c.accent }]}>
                  <Ionicons name="person" size={28} color="#FFFFFF" />
                </View>
              )}
              {!settings.avatarUri && (
                <View style={[styles.avatarBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Ionicons name="camera" size={12} color={c.textSecondary} />
                </View>
              )}
            </Pressable>
            <View style={styles.profileInfo}>
              <TextInput
                style={[
                  styles.nicknameInput,
                  { color: c.text, fontFamily: Fonts.semiBold },
                ]}
                placeholder={t.nicknamePlaceholder}
                placeholderTextColor={c.inactive}
                value={settings.nickname}
                onChangeText={(text) => update({ nickname: text })}
                maxLength={20}
                returnKeyType="done"
              />
              {!settings.nickname && (
                <Text
                  style={[
                    styles.nicknameLabel,
                    { color: c.textSecondary, fontFamily: Fonts.regular },
                  ]}
                >
                  {t.nickname}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 数据统计 */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text
            style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
          >
            {t.trainingStats}
          </Text>
          <View style={styles.statsGrid}>
            <StatItem label={t.totalDays} value={`${totalDays}`} colors={c} />
            <StatItem label={t.currentStreak} value={t.streakValue(streak)} colors={c} />
            <StatItem label={t.longestStreak} value={t.streakValue(longestStreak)} colors={c} />
            <StatItem
              label={t.totalNotes}
              value={`${logs.reduce((sum, l) => sum + l.notes.length, 0)}`}
              colors={c}
            />
          </View>
        </View>

        {/* 月度趋势 */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text
            style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
          >
            {t.monthlyTrend}
          </Text>
          <View style={styles.trendChart}>
            {monthlyTrend.map((item) => (
              <View key={item.label} style={styles.trendCol}>
                <Text
                  style={[
                    styles.trendCount,
                    { color: c.textSecondary, fontFamily: Fonts.medium },
                  ]}
                >
                  {item.count}
                </Text>
                <View
                  style={[
                    styles.trendBar,
                    {
                      backgroundColor: item.count > 0 ? c.accent : c.barBackground,
                      height: item.count > 0 ? Math.min(Math.max(item.count * 3, 8), 76) : 4,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.trendLabel,
                    { color: c.textSecondary, fontFamily: Fonts.regular },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 周目标 */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text
            style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
          >
            {t.weeklyGoal}
          </Text>
          <View style={styles.optionRow}>
            {goalOptions.map((g) => (
              <Pressable
                key={g}
                onPress={() => update({ weeklyGoal: g })}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor:
                      settings.weeklyGoal === g ? c.accent : c.background,
                    borderColor: c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: settings.weeklyGoal === g ? "#FFFFFF" : c.text,
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

        {/* 训练提醒 */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text
            style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
          >
            {t.trainingReminder}
          </Text>
          <View style={styles.switchRow}>
            <Text
              style={[styles.switchLabel, { color: c.text, fontFamily: Fonts.regular }]}
            >
              {t.dailyReminder}
            </Text>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: c.barBackground, true: c.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.reminderEnabled && (
            <View style={styles.timeRow}>
              <Text
                style={[
                  styles.timeLabel,
                  { color: c.textSecondary, fontFamily: Fonts.regular },
                ]}
              >
                {t.reminderTime}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timeOptions}
              >
                {hourOptions.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => handleChangeHour(h)}
                    style={[
                      styles.timeBtn,
                      {
                        backgroundColor:
                          settings.reminderHour === h ? c.accent : c.background,
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        {
                          color: settings.reminderHour === h ? "#FFFFFF" : c.text,
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

        {/* 所有笔记 */}
        <Pressable
          onPress={() => router.push("/notes")}
          style={[styles.actionRow, { backgroundColor: c.surface }]}
        >
          <Ionicons name="document-text-outline" size={20} color={c.accent} />
          <Text
            style={[styles.actionText, { color: c.text, fontFamily: Fonts.medium }]}
          >
            {t.allNotes}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={c.inactive} />
        </Pressable>

        {/* 导出数据 */}
        <Pressable
          onPress={handleExport}
          style={[styles.actionRow, { backgroundColor: c.surface }]}
        >
          <Ionicons name="share-outline" size={20} color={c.accent} />
          <Text
            style={[styles.actionText, { color: c.text, fontFamily: Fonts.medium }]}
          >
            {t.exportData}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={c.inactive} />
        </Pressable>

        {/* 隐私政策 */}
        <Pressable
          onPress={() => router.push("/privacy")}
          style={[styles.actionRow, { backgroundColor: c.surface }]}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={c.accent} />
          <Text style={[styles.actionText, { color: c.text, fontFamily: Fonts.medium }]}>
            {t.privacyPolicy}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={c.inactive} />
        </Pressable>

        {/* 关于 */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text
            style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.semiBold }]}
          >
            {t.about}
          </Text>
          <Text
            style={[
              styles.aboutText,
              { color: c.textSecondary, fontFamily: Fonts.regular },
            ]}
          >
            HoopLog v{appJson.expo.version}{"\n"}{t.aboutDesc}{"\n"}{t.aboutStorage}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.statItem}>
      <Text
        style={[styles.statValue, { color: colors.accent, fontFamily: Fonts.bold }]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          { color: colors.textSecondary, fontFamily: Fonts.regular },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  title: { fontSize: FontSizes.xxl, marginBottom: Spacing.lg },

  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSizes.md, marginBottom: Spacing.md },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statItem: {
    width: "47%",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  statValue: { fontSize: FontSizes.xl, marginBottom: 4 },
  statLabel: { fontSize: FontSizes.sm },

  optionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: { fontSize: FontSizes.sm },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: { fontSize: FontSizes.md },

  timeRow: { marginTop: Spacing.md },
  timeLabel: { fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  timeOptions: { gap: Spacing.sm },
  timeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  timeText: { fontSize: FontSizes.sm },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  actionText: { flex: 1, fontSize: FontSizes.md },

  aboutText: { fontSize: FontSizes.sm, lineHeight: 22 },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  nicknameInput: {
    fontSize: FontSizes.lg,
    padding: 0,
  },
  nicknameLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },

  trendChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  trendCol: { alignItems: "center", flex: 1, justifyContent: "flex-end" },
  trendCount: { fontSize: FontSizes.xs, marginBottom: 4 },
  trendBar: { width: 28, borderRadius: Radius.sm, marginBottom: Spacing.xs },
  trendLabel: { fontSize: FontSizes.xs },

});
